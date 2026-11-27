// ParticleText.js

const TAU = Math.PI * 2

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max)

const easeOutCubic = (t) =>
  1 - Math.pow(1 - t, 3)

export function setupParticleText(container, canvas, options) {
  const ctx = canvas.getContext('2d')

  const sampleCanvas = document.createElement('canvas')
  const sampleCtx = sampleCanvas.getContext('2d', {
    willReadFrequently: true,
  })

  if (!ctx || !sampleCtx) return () => {}

  let particles = []
  let width = 0
  let height = 0
  let dpr = 1
  let raf = 0
  let resizeFrame = 0
  let startTime = 0
  let lastTime = 0
  let buildId = 0

  let gathering = false
  let visible = false
  let played = false
  let destroyed = false

  const motionQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  )

  let reducedMotion = motionQuery.matches

  const pointer = {
    x: 0,
    y: 0,
    active: false,
  }

  const resolveFontSize = () => {
    if (typeof options.fontSize === 'number') {
      return options.fontSize
    }

    const probe = document.createElement('span')

    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    probe.style.fontSize = options.fontSize
    probe.textContent = 'M'

    container.appendChild(probe)

    const size =
      parseFloat(getComputedStyle(probe).fontSize) || 100

    probe.remove()

    return size
  }

  const getFontFamily = () => {
    return options.fontFamily === 'inherit'
      ? getComputedStyle(container).fontFamily
      : options.fontFamily
  }

  const getColor = (color) => {
    return color === 'currentColor'
      ? getComputedStyle(container).color
      : color
  }

  // Scatter particles and gather them into the text.

  function startIntro() {
    if (!particles.length) return

    played = true

    if (reducedMotion) {
      gathering = false

      particles.forEach((p) => {
        p.x = p.targetX
        p.y = p.targetY
        p.startX = p.targetX
        p.startY = p.targetY
        p.offsetX = 0
        p.offsetY = 0
        p.vx = 0
        p.vy = 0
      })

      wake()
      return
    }

    const spread = Math.min(
      options.scatter,
      width * 0.3
    )

    particles.forEach((p) => {
      const angle = Math.random() * TAU
      const distance = spread * (0.35 + Math.random() * 0.75)

      if (options.intro === 'rain') {
        p.startX = p.targetX + (Math.random() - 0.5) * 30
        p.startY = -Math.random() * height
      } else if (options.intro === 'spiral') {
        const dx = p.targetX - width / 2
        const dy = p.targetY - height / 2
        const radius = Math.hypot(dx, dy) + distance
        const rotation = Math.atan2(dy, dx) + Math.PI

        p.startX = width / 2 + Math.cos(rotation) * radius
        p.startY = height / 2 + Math.sin(rotation) * radius
      } else {
        p.startX =
          p.targetX + Math.cos(angle) * distance

        p.startY =
          p.targetY + Math.sin(angle) * distance
      }

      p.x = p.startX
      p.y = p.startY

      p.delay = Math.random() * options.stagger

      p.offsetX = 0
      p.offsetY = 0
      p.vx = 0
      p.vy = 0
    })

    startTime = performance.now()
    gathering = true

    wake()
  }

  // Convert the text into thousands of particle targets.

  async function buildParticles() {
    const currentBuild = ++buildId

    const rect = container.getBoundingClientRect()

    if (!rect.width || !rect.height) return

    width = Math.floor(rect.width)
    height = Math.floor(rect.height)

    dpr = Math.min(window.devicePixelRatio || 1, 2)

    const family = getFontFamily()

    let fontSize = resolveFontSize()

    let font = `${options.fontWeight} ${fontSize}px ${family}`

    if (document.fonts) {
      try {
        await document.fonts.load(font)
        await document.fonts.ready
      } catch {
        // Continue with the available font.
      }
    }

    if (destroyed || currentBuild !== buildId) return

    sampleCtx.font = font

    const metrics = sampleCtx.measureText(options.text)

    const maxWidth = width * 0.97

    const maxHeight = height * 0.9

    const glyphHeight =
      (metrics.actualBoundingBoxAscent || fontSize * 0.8) +
      (metrics.actualBoundingBoxDescent || 0)

    fontSize *= Math.min(
      1,
      maxWidth / Math.max(1, metrics.width),
      maxHeight / Math.max(1, glyphHeight)
    )

    font = `${options.fontWeight} ${fontSize}px ${family}`

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)

    sampleCanvas.width = width
    sampleCanvas.height = height

    sampleCtx.clearRect(0, 0, width, height)

    sampleCtx.font = font
    sampleCtx.textAlign = 'center'
    sampleCtx.textBaseline = 'alphabetic'
    sampleCtx.fillStyle = '#ffffff'

    const finalMetrics = sampleCtx.measureText(options.text)

    const ascent =
      finalMetrics.actualBoundingBoxAscent || fontSize * 0.8

    const descent =
      finalMetrics.actualBoundingBoxDescent || 0

    const baseline = height / 2 + (ascent - descent) / 2

    sampleCtx.fillText(
      options.text,
      width / 2,
      baseline
    )

    const imageData = sampleCtx.getImageData(
      0,
      0,
      width,
      height
    ).data

    const targets = []

    const density = Math.max(
      2,
      Math.floor(options.density)
    )

    for (let y = 0; y < height; y += density) {
      for (let x = 0; x < width; x += density) {
        const index = (y * width + x) * 4

        if (imageData[index + 3] > 100) {
          targets.push({ x, y })
        }
      }
    }

    // Limit particle count for smooth performance.

    const maxParticles = width < 600 ? 4500 : 12000

    const stride = Math.max(
      1,
      Math.ceil(targets.length / maxParticles)
    )

    particles = targets
      .filter((_, index) => index % stride === 0)
      .map((target) => ({
        x: target.x,
        y: target.y,

        targetX: target.x,
        targetY: target.y,

        startX: target.x,
        startY: target.y,

        offsetX: 0,
        offsetY: 0,

        vx: 0,
        vy: 0,

        delay: 0,
        seed: Math.random() * TAU,
        depth: 0.5 + Math.random() * 0.5,
      }))

    gathering = false

    if (visible && !played) {
      startIntro()
    } else if (played || reducedMotion) {
      draw(performance.now())
    }

    wake()
  }

  // Main animation and rendering.

  function draw(now) {
    if (!particles.length) return false

    const dt = lastTime
      ? Math.min((now - lastTime) / 1000, 0.033)
      : 1 / 60

    lastTime = now

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const baseColor = getColor(options.color)
    const highlightColor = getColor(options.highlightColor)

    const particleSize = Math.max(0.5, options.particleSize)

    const normalParticles = []
    const highlightedParticles = []

    let complete = true
    let moving = false

    for (const p of particles) {
      let targetX = p.targetX
      let targetY = p.targetY
      let progress = 1

      // Gather animation.

      if (gathering && !reducedMotion) {
        progress = clamp(
          (now - startTime - p.delay) /
            Math.max(1, options.gatherDuration),
          0,
          1
        )

        const eased = easeOutCubic(progress)

        targetX =
          p.startX + (p.targetX - p.startX) * eased

        targetY =
          p.startY + (p.targetY - p.startY) * eased

        if (progress < 1) complete = false
      }

      // Subtle floating effect.

      else if (!reducedMotion && options.idleDrift > 0) {
        targetX +=
          Math.sin(now * 0.0008 + p.seed) *
          options.idleDrift

        targetY +=
          Math.cos(now * 0.0007 + p.seed) *
          options.idleDrift
      }

      // Mouse repel effect.

      if (pointer.active && !reducedMotion) {
        const dx = targetX - pointer.x
        const dy = targetY - pointer.y

        const distance = Math.hypot(dx, dy)

        if (distance > 0 && distance < options.repelRadius) {
          const force =
            Math.pow(1 - distance / options.repelRadius, 2) *
            options.pointerRepel

          targetX += (dx / distance) * force
          targetY += (dy / distance) * force
        }
      }

      // Spring physics for the click burst.

      if (!reducedMotion) {
        p.vx += (-18 * p.offsetX - 7.5 * p.vx) * dt
        p.vy += (-18 * p.offsetY - 7.5 * p.vy) * dt

        p.offsetX += p.vx * dt
        p.offsetY += p.vy * dt

        targetX += p.offsetX
        targetY += p.offsetY
      }

      const follow = reducedMotion
        ? 1
        : 1 - Math.pow(0.78, dt * 60)

      const moveX = (targetX - p.x) * follow
      const moveY = (targetY - p.y) * follow

      p.x += moveX
      p.y += moveY

      if (Math.abs(moveX) + Math.abs(moveY) > 0.02) {
        moving = true
      }

      const distance = Math.hypot(
        p.x - p.targetX,
        p.y - p.targetY
      )

      if (
        options.highlightMode === 'gradient'
          ? p.targetX > width * 0.55
          : distance > 10
      ) {
        highlightedParticles.push(p)
      } else {
        normalParticles.push(p)
      }
    }

    if (gathering && complete) {
      gathering = false
    }

    // Render particles in groups for better performance.

    const drawGroup = (group, color) => {
      ctx.fillStyle = color
      ctx.strokeStyle = color

      ctx.beginPath()

      for (const p of group) {
        const size = particleSize * (0.8 + p.depth * 0.2)

        if (options.shape === 'square') {
          ctx.rect(
            p.x - size / 2,
            p.y - size / 2,
            size,
            size
          )
        } else if (options.shape === 'line') {
          ctx.moveTo(p.x - size, p.y + size)
          ctx.lineTo(p.x + size, p.y - size)
        } else {
          ctx.moveTo(p.x + size / 2, p.y)

          ctx.arc(
            p.x,
            p.y,
            size / 2,
            0,
            TAU
          )
        }
      }

      if (options.shape === 'line') {
        ctx.lineWidth = Math.max(0.8, particleSize * 0.65)
        ctx.lineCap = 'round'
        ctx.stroke()
      } else {
        ctx.fill()
      }
    }

    ctx.globalAlpha = 0.95
    drawGroup(normalParticles, baseColor)

    if (options.glow && highlightedParticles.length) {
      ctx.shadowColor = highlightColor
      ctx.shadowBlur = 6
    }

    ctx.globalAlpha = 0.9
    drawGroup(highlightedParticles, highlightColor)

    ctx.shadowBlur = 0
    ctx.globalAlpha = 1

    return (
      gathering ||
      moving ||
      (!reducedMotion && options.idleDrift > 0) ||
      (!reducedMotion && pointer.active)
    )
  }

  function frame(now) {
    raf = 0

    if (destroyed || !visible) return

    const busy = draw(now)

    if (busy) {
      raf = requestAnimationFrame(frame)
    }
  }

  function wake() {
    if (raf || destroyed || !visible) return

    lastTime = 0
    raf = requestAnimationFrame(frame)
  }

  // Mouse interaction.

  function locatePointer(event) {
    const rect = canvas.getBoundingClientRect()

    pointer.x = event.clientX - rect.left
    pointer.y = event.clientY - rect.top
  }

  function handlePointerMove(event) {
    locatePointer(event)

    pointer.active = true

    wake()
  }

  function handlePointerEnter(event) {
    handlePointerMove(event)

    if (options.trigger === 'hover' && played) {
      startIntro()
    }
  }

  function handlePointerLeave() {
    pointer.active = false
    wake()
  }

  function handleClick(event) {
    if (reducedMotion) return

    if (options.trigger === 'click') {
      startIntro()
      return
    }

    if (!options.clickBurst) return

    locatePointer(event)

    const radius = options.repelRadius * 1.5

    for (const p of particles) {
      const dx = p.x - pointer.x
      const dy = p.y - pointer.y

      const distance = Math.hypot(dx, dy)

      if (distance >= radius) continue

      const angle =
        Math.atan2(dy, dx) +
        (Math.random() - 0.5) * 0.7

      const force =
        900 *
        options.burstStrength *
        Math.pow(1 - distance / radius, 2)

      p.vx += Math.cos(angle) * force
      p.vy += Math.sin(angle) * force
    }

    wake()
  }

  // Responsive canvas.

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame)

    resizeFrame = requestAnimationFrame(buildParticles)
  })

  resizeObserver.observe(container)

  // Start animation when the footer enters the viewport.

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting

      if (visible) {
        if (!played && particles.length) {
          startIntro()
        }

        wake()
      } else {
        cancelAnimationFrame(raf)
        raf = 0
        pointer.active = false

        // Replay when scrolling back to the footer.
        if (options.replayOnScroll) {
          played = false
        }
      }
    },
    {
      threshold: 0.12,
    }
  )

  intersectionObserver.observe(container)

  function handleMotionChange(event) {
    reducedMotion = event.matches

    if (reducedMotion) {
      gathering = false

      particles.forEach((p) => {
        p.x = p.targetX
        p.y = p.targetY
        p.vx = 0
        p.vy = 0
        p.offsetX = 0
        p.offsetY = 0
      })
    }

    wake()
  }

  motionQuery.addEventListener('change', handleMotionChange)

  canvas.addEventListener('pointermove', handlePointerMove)
  canvas.addEventListener('pointerenter', handlePointerEnter)
  canvas.addEventListener('pointerleave', handlePointerLeave)
  canvas.addEventListener('click', handleClick)

  buildParticles()

  // Component cleanup.

  return () => {
    destroyed = true
    buildId++

    cancelAnimationFrame(raf)
    cancelAnimationFrame(resizeFrame)

    resizeObserver.disconnect()
    intersectionObserver.disconnect()

    motionQuery.removeEventListener(
      'change',
      handleMotionChange
    )

    canvas.removeEventListener(
      'pointermove',
      handlePointerMove
    )

    canvas.removeEventListener(
      'pointerenter',
      handlePointerEnter
    )

    canvas.removeEventListener(
      'pointerleave',
      handlePointerLeave
    )

    canvas.removeEventListener('click', handleClick)
  }
}