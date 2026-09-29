document.addEventListener('DOMContentLoaded', () => {
    
    // --- Set Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- SPA Page Navigation ---
    const pageLinks = document.querySelectorAll('.nav-link[data-page], .logo, .btn[href="#projects"], .btn[href="#contact"]');
    const pages = {
        'home': document.getElementById('home-page'),
        'about': document.getElementById('about'),
        'contact': document.getElementById('contact')
    };

    function showPage(pageId) {
        // Hide all
        Object.values(pages).forEach(page => {
            if (page) page.style.display = 'none';
        });
        // Show target
        if (pages[pageId]) {
            pages[pageId].style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }

    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const pageId = link.getAttribute('data-page') || 'home'; // Logo defaults to home
            const isPageSwitch = pages[pageId] != null;
            
            if (isPageSwitch) {
                if (link.getAttribute('href').startsWith('#') && pageId !== 'home') {
                    e.preventDefault();
                }
                showPage(pageId);
            }
        });
    });

    // --- Cute mascot follows the mouse softly ---
    const mascot = document.querySelector('.hero-mascot');
    if (mascot && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        window.addEventListener('pointermove', (event) => {
            const rect = mascot.getBoundingClientRect();
            const dx = event.clientX - (rect.left + rect.width / 2);
            const dy = event.clientY - (rect.top + rect.height / 2);
            targetX = Math.max(-55, Math.min(55, dx * 0.055));
            targetY = Math.max(-38, Math.min(38, dy * 0.045));
        }, { passive: true });

        const followMouse = () => {
            currentX += (targetX - currentX) * 0.035;
            currentY += (targetY - currentY) * 0.035;
            mascot.style.setProperty('--mouse-x', currentX.toFixed(2) + 'px');
            mascot.style.setProperty('--mouse-y', currentY.toFixed(2) + 'px');
            requestAnimationFrame(followMouse);
        };
        followMouse();
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Navbar Scroll Effect & Back to Top ---
    const navbar = document.querySelector('.navbar');
    const backToTop = document.getElementById('back-to-top');

    const handleScroll = () => {
        const scrollPos = window.scrollY;
        
        // Navbar styling
        if (scrollPos > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top visibility
        if (backToTop) {
            if (scrollPos > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once revealed
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback for no IntersectionObserver or reduced motion
        revealElements.forEach(el => {
            el.classList.add('active');
        });
    }

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const scrollActive = () => {
        const scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Offset for navbar
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(sectionId)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', scrollActive);

    // =========================================================
    // --- Image Sliders (auto-advance + dots + lightbox) ---
    // =========================================================
    const sliders = document.querySelectorAll('[data-slider]');

    sliders.forEach(wrapper => {
        const imgs = wrapper.querySelectorAll('img');
        if (imgs.length <= 1) {
            // Single image — just make it clickable for lightbox
            imgs.forEach(img => {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', () => openLightbox(img.src, img.alt));
            });
            return;
        }

        // Build dots container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        imgs.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(wrapper, imgs, dotsContainer, i));
            dotsContainer.appendChild(dot);
        });
        // Insert dots after the wrapper (as sibling)
        wrapper.insertAdjacentElement('afterend', dotsContainer);

        let current = 0;
        let timer;

        function goToSlide(wrap, images, dotsEl, idx) {
            current = idx;
            wrap.scrollTo({ left: wrap.offsetWidth * idx, behavior: 'smooth' });
            dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => {
                d.classList.toggle('active', i === idx);
            });
        }

        function nextSlide() {
            const next = (current + 1) % imgs.length;
            goToSlide(wrapper, imgs, dotsContainer, next);
        }

        // Auto-advance every 3.5s
        function startTimer() {
            timer = setInterval(nextSlide, 3500);
        }
        function stopTimer() {
            clearInterval(timer);
        }

        startTimer();
        wrapper.addEventListener('mouseenter', stopTimer);
        wrapper.addEventListener('mouseleave', startTimer);

        // Click image to open lightbox
        imgs.forEach((img, i) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(img.src, img.alt);
            });
        });
    });

    // =========================================================
    // --- Lightbox (with prev / next navigation) ---
    // =========================================================
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn    = document.getElementById('lightbox-close');
    const prevBtn     = document.getElementById('lightbox-prev');
    const nextBtn     = document.getElementById('lightbox-next');

    // State: which slider + which index is currently open
    let lbImages  = [];   // array of {src, alt}
    let lbIndex   = 0;

    function openLightbox(src, alt, images, startIdx) {
        lbImages = images || [{ src, alt: alt || '' }];
        lbIndex  = startIdx != null ? startIdx : 0;
        showLbImage(lbIndex);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function showLbImage(idx) {
        lbIndex = idx;
        lightboxImg.src = lbImages[idx].src;
        lightboxImg.alt = lbImages[idx].alt || '';
        // Show/hide arrows based on number of images
        if (prevBtn && nextBtn) {
            prevBtn.classList.toggle('hidden', lbImages.length <= 1);
            nextBtn.classList.toggle('hidden', lbImages.length <= 1);
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; lbImages = []; }, 300);
    }

    if (lightbox) {
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showLbImage((lbIndex - 1 + lbImages.length) % lbImages.length);
        });
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showLbImage((lbIndex + 1) % lbImages.length);
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  showLbImage((lbIndex - 1 + lbImages.length) % lbImages.length);
            if (e.key === 'ArrowRight') showLbImage((lbIndex + 1) % lbImages.length);
        });
    }

    // Re-wire slider click → lightbox with full image list + correct index
    sliders.forEach(wrapper => {
        const imgs = wrapper.querySelectorAll('img');
        const imageList = Array.from(imgs).map(img => ({ src: img.src, alt: img.alt }));
        imgs.forEach((img, i) => {
            // Remove any existing single-image listener by cloning
            const fresh = img.cloneNode(true);
            img.parentNode.replaceChild(fresh, img);
            fresh.style.cursor = 'zoom-in';
            fresh.addEventListener('click', (e) => {
                e.stopPropagation();
                openLightbox(fresh.src, fresh.alt, imageList, i);
            });
        });
    });

    // =========================================================
    // --- Typewriter animation for the terminal ---
    // =========================================================
    const terminalBody = document.getElementById('terminal-body');
    if (terminalBody) {
        // Get all code lines (skip the blink cursor line if it has class 'blink')
        const lines = Array.from(terminalBody.children).filter(el => !el.classList.contains('blink'));
        
        const textNodes = [];
        
        // Recursively extract all text nodes with actual content
        function extractTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.nodeValue.trim() !== '') {
                    textNodes.push({
                        node: node,
                        chars: node.nodeValue.split('')
                    });
                }
            } else {
                node.childNodes.forEach(extractTextNodes);
            }
        }
        
        lines.forEach(line => {
            line.style.opacity = '1'; // ensure lines are visible (they were set to 0 in previous css)
            extractTextNodes(line);
        });

        function typeTerminal() {
            // Reset all text
            textNodes.forEach(item => item.node.nodeValue = '');
            
            let nodeIdx = 0;
            let charIdx = 0;
            
            function typeNext() {
                if (nodeIdx >= textNodes.length) {
                    // Done typing, wait 5s then restart
                    setTimeout(typeTerminal, 5000);
                    return;
                }
                
                const currentItem = textNodes[nodeIdx];
                currentItem.node.nodeValue += currentItem.chars[charIdx];
                
                charIdx++;
                if (charIdx >= currentItem.chars.length) {
                    nodeIdx++;
                    charIdx = 0;
                }
                
                // Hacker style random speed (10ms - 40ms)
                setTimeout(typeNext, Math.random() * 30 + 10);
            }
            
            setTimeout(typeNext, 800);
        }
        
        typeTerminal();
    }

});

