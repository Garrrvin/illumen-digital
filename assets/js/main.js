// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Handle smooth navigation clicks
document.querySelectorAll(".nav-item").forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (targetId && targetId.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        lenis.scrollTo(target, {
          offset: -100, // Account for header height
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else if (targetId === "#") {
        // Scroll to top for empty hash
        lenis.scrollTo(0);
      }
    }
  });
});

// Intersection Observer for fade-in elements
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

document
  .querySelectorAll(".fade-in, .cascade, .from-left, .from-right, .from-top")
  .forEach((el) => {
    observer.observe(el);
  });

// Magnetic Buttons (Removed per user request)
/*
const magnets = document.querySelectorAll('.magnet');
magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const position = magnet.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;

        magnet.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });

    magnet.addEventListener('mouseleave', () => {
        magnet.style.transform = 'translate(0px, 0px)';
    });
});
*/

const sections = document.querySelectorAll("section, header");
const navLi = document.querySelectorAll(".rail-marker");
const railFill = document.querySelector(".rail-fill");

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const totalHeight = docHeight - winHeight;
  const scrollRatio = totalHeight > 0 ? scrollTop / totalHeight : 0;

  // Theme tracks the specific 10% -> 25% window
  const themeProgress = Math.max(0, Math.min(1, (scrollRatio - 0.1) / (0.25 - 0.1)));

  // Dynamic Color Transition
  const rVal = Math.round(5 + themeProgress * 235);
  const gVal = Math.round(5 + themeProgress * 243);
  const bVal = Math.round(5 + themeProgress * 250);
  
  const textCurve = themeProgress < 0.5 ? Math.pow(themeProgress * 2, 2) * 0.5 : 1 - Math.pow((1 - themeProgress) * 2, 2) * 0.5;
  const textVal = Math.round(255 - textCurve * 250);
  const textB = Math.round(255 - textCurve * 239);
  const borderAlpha = 0.1 + themeProgress * 0.1;
  const overlayAlpha = 0.4 * (1 - themeProgress);

  document.documentElement.style.setProperty("--bg-current", `rgb(${rVal}, ${gVal}, ${bVal})`);
  document.documentElement.style.setProperty("--text-current", `rgb(${textVal}, ${textVal}, ${textB})`);
  document.documentElement.style.setProperty("--border-current", `rgba(${textVal}, ${textVal}, ${textB}, ${borderAlpha})`);
  document.documentElement.style.setProperty("--hero-overlay-alpha", overlayAlpha);

  // Active Section Highlight (Solid top-down logic)
  let current = "";
  const navSections = document.querySelectorAll("section.hero, section#services, section#about");
  const midPoint = window.innerHeight * 0.4;

  navSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= midPoint) {
      current = section.classList.contains("hero") ? "hero" : section.id;
    }
  });

  // End of page override
  const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
  if (isAtBottom) {
    current = "about";
  }

  navLi.forEach((li) => {
    li.classList.remove("active");
    if (li.dataset.target === current) {
      li.classList.add("active");
    }
  });

  // 1. Seamless Progress Bar logic
  // Instead of linear document scroll, we map progress to marker positions
  if (railFill && railFill.parentElement) {
    const railLine = railFill.parentElement;
    const railHeight = railLine.offsetHeight;
    const markers = Array.from(document.querySelectorAll('.rail-marker'));
    
    if (markers.length >= 3) {
      // Find marker centers relative to rail-line
      const railRect = railLine.getBoundingClientRect();
      const markerPoints = markers.map(m => {
        const mRect = m.getBoundingClientRect();
        return (mRect.top + mRect.height/2) - railRect.top;
      });

      let fillPX = 0;
      const hero = document.querySelector(".hero");
      const services = document.querySelector("#services");
      const about = document.querySelector("#about");
      const trigger1 = services.offsetTop - midPoint;
      const trigger2 = about.offsetTop - midPoint;
      const triggerBottom = document.body.scrollHeight - window.innerHeight;

      if (scrollTop <= trigger1) {
          // Start -> Services Activation
          const p = Math.max(0, Math.min(1, scrollTop / trigger1));
          fillPX = markerPoints[0] + (markerPoints[1] - markerPoints[0]) * p;
      } else if (scrollTop <= trigger2) {
          // Services Activation -> About Activation
          const p = Math.max(0, Math.min(1, (scrollTop - trigger1) / (trigger2 - trigger1)));
          fillPX = markerPoints[1] + (markerPoints[2] - markerPoints[1]) * p;
      } else {
          // About Activation -> Bottom
          const p = Math.max(0, Math.min(1, (scrollTop - trigger2) / (triggerBottom - trigger2)));
          if (isAtBottom) {
             fillPX = railHeight;
          } else {
             fillPX = markerPoints[2] + (railHeight - markerPoints[2]) * p;
          }
      }
      
      // Smoothly update fill
      railFill.style.height = `${(fillPX / railHeight) * 100}%`;
    }
  }

  // Side Rail Visibility
  const sideRail = document.querySelector(".side-rail");
  const aboutSection = document.getElementById("about");
  if (sideRail && aboutSection) {
    const rect = aboutSection.getBoundingClientRect();
    if (rect.bottom < window.innerHeight * 0.2) {
      sideRail.classList.remove("visible");
    } else {
      sideRail.classList.add("visible");
    }
  }
};

window.addEventListener("scroll", handleScroll);
// Initial check
handleScroll();

// Remove FOUC prevention after initial paint
requestAnimationFrame(() => {
  document.body.classList.remove("no-fouc");
});

// Cursor follower (Subtle)
const cursor = document.querySelector(".custom-cursor");
if (cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
}

// Text Splitting Utility (for door-reveal effect)
function splitTextIntoDoors(selector) {
  const element = document.querySelector(selector);
  if (!element) return;

  const content = element.innerHTML;
  const parts = content.split("<br>");

  element.innerHTML = parts
    .map((part, lineIdx) => {
      const trimmedPart = part.trim();
      return (
        trimmedPart
          .split("")
          .map((char, charIdx) => {
            const delay = lineIdx * 0.8 + charIdx * 0.1;
            return `<span style="transition-delay: ${delay}s">${char}</span>`;
          })
          .join("") + (lineIdx < parts.length - 1 ? "<br>" : "")
      );
    })
    .join("");

  element.classList.add("door-reveal");

  // If hero title, trigger immediately
  if (element.closest(".hero")) {
    requestAnimationFrame(() => {
      element.classList.add("visible");
    });
  } else {
    observer.observe(element);
  }
}

// Apply door reveal to Hero Title
splitTextIntoDoors(".hero .text-huge");

// Immediate triggers for fixed elements (ensures they don't disappear)
const immediateElements = document.querySelectorAll(
  "header.fade-in, .side-rail.fade-in, .hero .cascade",
);
immediateElements.forEach((el) => {
  requestAnimationFrame(() => {
    el.classList.add("visible");
  });
});

// Back to Top Functionality
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

backToTop.addEventListener("click", () => {
  lenis.scrollTo(0, {
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
});

// Contact Form / Drawer Logic
document.addEventListener("DOMContentLoaded", () => {
    const contactTrigger = document.getElementById("contactTrigger");
    const contactDrawer = document.getElementById("contactDrawer");
    const drawerClose = document.getElementById("drawerClose");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    console.log("Contact logic initializing...", { contactTrigger, contactDrawer });

    if (contactTrigger && contactDrawer) {
        const toggleDrawer = (show) => {
            if (show) {
                contactDrawer.classList.add("active");
                if (drawerOverlay) drawerOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            } else {
                contactDrawer.classList.remove("active");
                if (drawerOverlay) drawerOverlay.classList.remove("active");
                document.body.style.overflow = "";
                
                setTimeout(() => {
                    if (formStatus) {
                        formStatus.textContent = "";
                        formStatus.className = "form-status";
                    }
                }, 600);
            }
        };

        contactTrigger.addEventListener("click", (e) => {
            console.log("Contact button clicked");
            e.preventDefault();
            toggleDrawer(true);
        });

        if (drawerClose) {
            drawerClose.addEventListener("click", () => toggleDrawer(false));
        }

        if (drawerOverlay) {
            drawerOverlay.addEventListener("click", () => toggleDrawer(false));
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && contactDrawer.classList.contains("active")) {
                toggleDrawer(false);
            }
        });

        if (contactForm) {
            contactForm.addEventListener("submit", async (e) => {
                if (window.location.protocol === 'file:') return;

                e.preventDefault();
                const formData = new FormData(contactForm);
                const submitBtn = contactForm.querySelector(".submit-btn-large");
                
                let originalBtnText = "TRANSMIT";
                if (submitBtn) {
                    submitBtn.disabled = true;
                    originalBtnText = submitBtn.textContent;
                    submitBtn.textContent = "TRANSMITTING...";
                }
                
                if (formStatus) {
                    formStatus.textContent = "CONNECTING TO UPLINK...";
                    formStatus.className = "form-status";
                }

                try {
                    const response = await fetch(contactForm.action, {
                        method: "POST",
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        if (formStatus) {
                            formStatus.textContent = "TRANSMISSION SUCCESSFUL.";
                            formStatus.classList.add("success");
                        }
                        contactForm.reset();
                        setTimeout(() => toggleDrawer(false), 2500);
                    } else {
                        const result = await response.json();
                        const errorMessage = result.errors ? result.errors.map(e => e.message).join(", ") : "TRANSMISSION FAILED.";
                        throw new Error(errorMessage);
                    }
                } catch (error) {
                    console.error("Submission error:", error);
                    if (formStatus) {
                        formStatus.textContent = error.message || "TRANSMISSION FAILED.";
                        formStatus.classList.add("error");
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                }
            });
        }
    } else {
        console.error("Critical elements missing from DOM for contact drawer.");
    }
});



