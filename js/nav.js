(function () {
    'use strict';

    function initAutoHideNav() {
        return; // Disable auto-hide — nav is always visible
        if (window.matchMedia('(max-width: 600px)').matches) return;
        if (!window.matchMedia('(hover: hover)').matches) return;

        var nav = document.querySelector('.nav-container');
        if (!nav || nav.closest('.nav-shell')) return;

        var shell = document.createElement('div');
        shell.className = 'nav-shell';

        var zone = document.createElement('div');
        zone.className = 'nav-reveal-zone';
        zone.setAttribute('aria-hidden', 'true');

        nav.parentNode.insertBefore(shell, nav);
        shell.appendChild(zone);
        shell.appendChild(nav);

        document.documentElement.classList.add('nav-auto-hide');

        function openNav() {
            shell.classList.add('is-open');
        }

        function closeNav() {
            shell.classList.remove('is-open');
        }

        shell.addEventListener('mouseenter', openNav);
        shell.addEventListener('mouseleave', closeNav);
        shell.addEventListener('focusin', openNav);
        shell.addEventListener('focusout', function () {
            if (!shell.contains(document.activeElement)) {
                closeNav();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoHideNav);
    } else {
        initAutoHideNav();
    }
})();
