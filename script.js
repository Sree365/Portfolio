/* ═══════════════════════════════════════════════════
    FIX 5 — Three.js: Warm floating amber particle field
    with glowing rings that slowly orbit — classy & subtle
═══════════════════════════════════════════════════ */
(function () {
    const canvas = document.getElementById('threeCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 30);

    // ── Particle field ──────────────────────────────
    const COUNT = 380;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
        const r = 35 + Math.random() * 45;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        // amber to orange gradient per particle
        const t = Math.random();
        col[i * 3] = 0.96 - t * 0.07;   // R
        col[i * 3 + 1] = 0.62 - t * 0.25;   // G
        col[i * 3 + 2] = 0.04 + t * 0.04;   // B

        sizes[i] = 0.05 + Math.random() * 0.18;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pMat = new THREE.PointsMaterial({
        size: 0.22, vertexColors: true,
        transparent: true, opacity: .65,
        sizeAttenuation: true,
    });
    scene.add(new THREE.Points(geo, pMat));

    // ── Glowing rings ───────────────────────────────
    function makeRing(radius, tubeR, color, x, y, z, rx, ry) {
        const geo = new THREE.TorusGeometry(radius, tubeR, 16, 80);
        const mat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: .25, wireframe: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.x = rx; mesh.rotation.y = ry;
        scene.add(mesh);
        return mesh;
    }

    const rings = [
        makeRing(14, .06, 0xF59E0B, 4, -2, -8, .4, .2),
        makeRing(9, .04, 0xF97316, -6, 5, -12, .8, .5),
        makeRing(18, .05, 0xFCD34D, 2, 3, -15, .2, .9),
        makeRing(7, .035, 0xF97316, 8, -6, -6, 1.1, .3),
    ];

    // ── Floating soft spheres (glow orbs) ──────────
    function makeOrb(r, color, x, y, z) {
        const g = new THREE.SphereGeometry(r, 16, 16);
        const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .07 });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return mesh;
    }
    const orbs = [
        makeOrb(8, 0xF59E0B, 12, -8, -20),
        makeOrb(6, 0xF97316, -10, 6, -18),
        makeOrb(5, 0xFCD34D, 3, 10, -22),
    ];

    // ── Mouse parallax ──────────────────────────────
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth - .5) * 20;
        my = (e.clientY / window.innerHeight - .5) * 20;
    });

    // ── Animate ─────────────────────────────────────
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.004;

        // particle slow rotation
        geo.getAttribute('position').array;
        scene.children[0].rotation.y = t * 0.04;
        scene.children[0].rotation.x = t * 0.015;

        // rings orbit individually
        rings[0].rotation.z = t * .3;
        rings[0].rotation.x = .4 + Math.sin(t * .5) * .15;
        rings[1].rotation.z = -t * .2;
        rings[1].rotation.y = .5 + Math.cos(t * .4) * .2;
        rings[2].rotation.x = t * .15;
        rings[2].rotation.z = Math.sin(t * .3) * .3;
        rings[3].rotation.y = t * .4;
        rings[3].rotation.x = 1.1 + Math.sin(t * .7) * .2;

        // orbs float
        orbs[0].position.y = -8 + Math.sin(t * .6) * 3;
        orbs[1].position.y = 6 + Math.cos(t * .5) * 2.5;
        orbs[2].position.y = 10 + Math.sin(t * .4 + 1) * 2;

        // subtle mouse parallax
        camera.position.x += (mx * 2 - camera.position.x) * 0.03;
        camera.position.y += (-my * 2 - camera.position.y) * 0.03;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();


/* ═══════════════════════════════════════════════════
    NAVBAR + MOBILE MENU + ACTIVE SECTION TRACKING
═══════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const toggle = document.getElementById('navToggle');
const mobMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActive();
});

// FIX 2: Hamburger toggle ↔ X
function toggleMenu() {
    const isOpen = mobMenu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) highlightActive();
}
function closeMenu() {
    mobMenu.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
}

// Active section highlight in both desktop nav and mobile menu
const sections = document.querySelectorAll('section[id]');
const desktopLinks = document.querySelectorAll('#navLinks a');
const mobileLinks = document.querySelectorAll('.mobile-menu li a');

function highlightActive() {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    // desktop
    desktopLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
    // FIX 2: mobile active highlight
    mobileLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
    // desktop
    desktopLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
}

// Fade-in observer
const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .1 });
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

// Form feedback
function handleSubmit(btn) {
    btn.textContent = 'Message Sent! ✓';
    btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    setTimeout(() => { btn.textContent = 'Send Message ✦'; btn.style.background = ''; }, 3000);
}

/* ═══════════════════════════════════════════════════
    PROJECT SLIDER — drag / click / keyboard / touch
═══════════════════════════════════════════════════ */
(function () {
    const track = document.getElementById('sliderTrack');
    const wrap = document.getElementById('sliderWrap');
    const btnPrev = document.getElementById('sarrowPrev');
    const btnNext = document.getElementById('sarrowNext');
    const dotsEl = document.getElementById('sliderDots');
    const cCur = document.getElementById('cCur');

    const slides = track.querySelectorAll('.proj-card');
    const total = slides.length;
    let current = 0;

    /* Build dots */
    const dots = [];
    slides.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'sdot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
        dots.push(d);
    });

    function goTo(idx) {
        // Wrap around for infinite loop
        current = ((idx % total) + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        cCur.textContent = current + 1;
        // Arrows always enabled — no dead ends
        btnPrev.disabled = false;
        btnNext.disabled = false;
    }

    btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext.addEventListener('click', () => goTo(current + 1));

    /* Keyboard arrows */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    /* Touch swipe */
    let touchStartX = 0, touchDelta = 0;
    wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchmove', e => { touchDelta = e.touches[0].clientX - touchStartX; }, { passive: true });
    wrap.addEventListener('touchend', () => {
        if (Math.abs(touchDelta) > 50) goTo(touchDelta < 0 ? current + 1 : current - 1);
        touchDelta = 0;
    });

    /* Mouse drag */
    let dragStartX = 0, isDragging = false;
    wrap.addEventListener('mousedown', e => { isDragging = true; dragStartX = e.clientX; wrap.classList.add('dragging'); });
    window.addEventListener('mousemove', e => { if (!isDragging) return; });
    window.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        wrap.classList.remove('dragging');
        const delta = e.clientX - dragStartX;
        if (Math.abs(delta) > 60) goTo(delta < 0 ? current + 1 : current - 1);
    });

    goTo(0);
})();

// Kick initial highlight
highlightActive();