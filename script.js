/**
 * Bhagwati Dental Clinic & Implant Centre - Master Multi-Page JavaScript
 * Lead Dentist: Dr. Tanu Gupta (MDS Endodontics, Certified Implantologist)
 * Shop GF-9, Super Complex, Ranipur More, Jwalapur, Haridwar
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClinicStatus();
  initEnhancedNavigation();
  initBookingForms();
  initFaqAccordion();
  initScrollTop();
  initClipboardButtons();
  initTreatmentModal();
});

/* ==========================================================================
   1. LIVE CLINIC OPEN / CLOSED STATUS (IST Time)
   ========================================================================== */
function initLiveClinicStatus() {
  const statusPills = document.querySelectorAll('.live-status-pill');
  if (!statusPills.length) return;

  function updateStatus() {
    // Current time in IST (UTC+5:30)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));

    const day = istTime.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Morning shift: 10:00 AM (600 mins) to 2:00 PM (840 mins) - Every day
    const morningStart = 10 * 60;
    const morningEnd = 14 * 60;

    // Evening shift: 5:00 PM (1020 mins) to 8:00 PM (1200 mins) - Mon to Sat
    const eveningStart = 17 * 60;
    const eveningEnd = 20 * 60;

    let isOpen = false;
    let statusText = 'Closed Now';
    let detailText = 'Opens at 10:00 AM';

    if (day === 0) {
      // Sunday
      if (currentMinutes >= morningStart && currentMinutes < morningEnd) {
        isOpen = true;
        statusText = 'Open Now';
        detailText = 'Closes at 2:00 PM';
      } else if (currentMinutes < morningStart) {
        isOpen = false;
        statusText = 'Closed Now';
        detailText = 'Opens Today at 10:00 AM';
      } else {
        isOpen = false;
        statusText = 'Closed for the Day';
        detailText = 'Opens Mon 10:00 AM';
      }
    } else {
      // Monday to Saturday
      if (currentMinutes >= morningStart && currentMinutes < morningEnd) {
        isOpen = true;
        statusText = 'Open Now';
        detailText = 'Closes at 2:00 PM';
      } else if (currentMinutes >= morningEnd && currentMinutes < eveningStart) {
        isOpen = false;
        statusText = 'Closed (Afternoon Break)';
        detailText = 'Reopens at 5:00 PM';
      } else if (currentMinutes >= eveningStart && currentMinutes < eveningEnd) {
        isOpen = true;
        statusText = 'Open Now';
        detailText = 'Closes at 8:00 PM';
      } else if (currentMinutes < morningStart) {
        isOpen = false;
        statusText = 'Closed Now';
        detailText = 'Opens Today at 10:00 AM';
      } else {
        isOpen = false;
        statusText = 'Closed for the Day';
        detailText = (day === 6) ? 'Opens Sun 10:00 AM' : 'Opens Tomorrow at 10:00 AM';
      }
    }

    statusPills.forEach(pill => {
      const dot = pill.querySelector('.status-dot');
      const text = pill.querySelector('.status-label');
      if (dot && text) {
        if (isOpen) {
          dot.className = 'status-dot';
          text.innerHTML = `<strong>${statusText}</strong> &bull; ${detailText}`;
        } else {
          dot.className = 'status-dot closed';
          text.innerHTML = `<strong>${statusText}</strong> &bull; ${detailText}`;
        }
      }
    });

    // Highlight current day in opening hours table
    const dayRows = document.querySelectorAll('.hours-row[data-day]');
    dayRows.forEach(row => {
      const rowDay = parseInt(row.getAttribute('data-day'), 10);
      if (rowDay === day) {
        row.classList.add('today');
      } else {
        row.classList.remove('today');
      }
    });
  }

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* ==========================================================================
   2. ENHANCED MULTI-PAGE NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initEnhancedNavigation() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = menuBtn.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
      }
    });
  }

  // Handle dropdown toggle on mobile devices
  dropdownItems.forEach(item => {
    const triggerLink = item.querySelector('.nav-link');
    if (triggerLink) {
      triggerLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Highlight active page automatically
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-item a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      const parentDropdown = link.closest('.nav-item.has-dropdown');
      if (parentDropdown) {
        const parentLink = parentDropdown.querySelector('.nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    }
  });
}

/* ==========================================================================
   3. BOOKING FORM & DIRECT WHATSAPP INTEGRATION
   ========================================================================== */
const CLINIC_WHATSAPP = '918126733498'; // Phone: +91 81267 33498
const CLINIC_PHONE = '+91 81267 33498';

function initBookingForms() {
  const forms = document.querySelectorAll('.appointment-form, #heroBookingForm, #mainBookingForm');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormBooking(form);
    });
  });

  // Set default appointment date to tomorrow
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.min = new Date().toISOString().split('T')[0];
    if (!input.value) input.value = minDateStr;
  });
}

function handleFormBooking(form) {
  const nameInput = form.querySelector('[name="patient_name"]');
  const phoneInput = form.querySelector('[name="patient_phone"]');
  const serviceInput = form.querySelector('[name="treatment_service"]');
  const dateInput = form.querySelector('[name="appointment_date"]');
  const slotInput = form.querySelector('[name="preferred_slot"]');
  const notesInput = form.querySelector('[name="patient_notes"]');

  const patientName = nameInput ? nameInput.value.trim() : 'Patient';
  const patientPhone = phoneInput ? phoneInput.value.trim() : 'Not provided';
  const service = serviceInput ? serviceInput.value : 'Consultation';
  const appDate = dateInput ? dateInput.value : 'Soonest available';
  const slot = slotInput ? slotInput.value : 'Anytime';
  const notes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : 'None';

  if (!patientName || !patientPhone) {
    showToast('Please enter your Name and Phone Number.');
    return;
  }

  // Pre-formatted WhatsApp text
  const message = `*🦷 APPOINTMENT REQUEST - Bhagwati Dental Clinic & Implant Centre*

*Patient Name:* ${patientName}
*Contact Number:* ${patientPhone}
*Treatment / Reason:* ${service}
*Preferred Date:* ${appDate}
*Preferred Time Slot:* ${slot}
*Consultation Fee:* ₹200 (Rupees Two Hundred Only)
*Additional Notes:* ${notes}

📍 *Clinic:* Shop GF-9, Super Complex, Ranipur More, Near City Hospital / Opp IDBI Bank, Jwalapur, Haridwar.
Please confirm my appointment slot. Thank you!`;

  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${CLINIC_WHATSAPP}?text=${encodedMsg}`;

  // Show friendly confirmation modal
  showBookingConfirmationModal({
    name: patientName,
    phone: patientPhone,
    service: service,
    date: appDate,
    slot: slot,
    whatsappUrl: whatsappUrl
  });

  window.open(whatsappUrl, '_blank');
}

function showBookingConfirmationModal(data) {
  let modalOverlay = document.getElementById('bookingConfirmModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'bookingConfirmModal';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <button class="modal-close-btn" onclick="closeBookingModal()">&times;</button>
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="width: 60px; height: 60px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 0.75rem;">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 style="font-size: 1.35rem; color: var(--primary-deep); font-weight: 800;">Appointment Request Ready!</h3>
        <p style="font-size: 0.875rem; color: var(--text-muted);">We are forwarding your request directly to Dr. Tanu Gupta's clinic desk.</p>
      </div>

      <div style="background-color: var(--bg-page); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; font-size: 0.875rem; border: 1px solid var(--border-color);">
        <p style="margin-bottom: 0.35rem;"><strong>Patient:</strong> ${data.name} (${data.phone})</p>
        <p style="margin-bottom: 0.35rem;"><strong>Treatment:</strong> ${data.service}</p>
        <p style="margin-bottom: 0.35rem;"><strong>Date & Time:</strong> ${data.date} (${data.slot})</p>
        <p style="margin-bottom: 0.35rem;"><strong>Consultation Fee:</strong> &#8377;200 (Payable at clinic)</p>
        <p style="margin-bottom: 0;"><strong>Clinic Address:</strong> GF-9, Super Complex, Ranipur More, Jwalapur</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <a href="${data.whatsappUrl}" target="_blank" class="btn btn-whatsapp" style="width: 100%;">
          <i class="fab fa-whatsapp"></i> Send on WhatsApp Now
        </a>
        <a href="tel:${CLINIC_PHONE}" class="btn btn-secondary" style="width: 100%;">
          <i class="fas fa-phone-alt"></i> Call Clinic (+91 81267 33498)
        </a>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeBookingModal();
  });
}

window.closeBookingModal = function() {
  const modal = document.getElementById('bookingConfirmModal');
  if (modal) modal.classList.remove('active');
};

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item) otherItem.classList.remove('active');
      });

      item.classList.toggle('active', !isActive);
    });
  });
}

/* ==========================================================================
   5. TREATMENT DETAILS MODAL
   ========================================================================== */
const TREATMENT_DETAILS = {
  'rct': {
    title: 'Single-Sitting Root Canal Treatment (RCT)',
    badge: 'Specialty Endodontics',
    description: 'Dr. Tanu Gupta is a specialized Endodontist (MDS) with over 18 years of clinical expertise in saving infected teeth using modern rotary endodontics and apex locators without discomfort.',
    symptoms: [
      'Severe throbbing pain while chewing or biting',
      'Lingering sensitivity to hot or cold drinks',
      'Darkening or deep discoloration of the tooth',
      'Swelling or pimple-like bump on the gum'
    ],
    features: [
      'Single-sitting RCT whenever clinically indicated',
      'Computerized apex locators for 99.8% canal length precision',
      'Rotary nickel-titanium instrumentation (painless & fast)',
      'Hermetic 3D obturation & post-and-core strengthening'
    ],
    duration: 'Typically 45–60 minutes per sitting'
  },
  'implants': {
    title: 'Advanced Dental Implantology',
    badge: 'Certified Implant Center',
    description: 'Permanent, lifelike replacement for single, multiple, or all missing teeth. Implants fuse with your jawbone to restore natural chewing power and prevent facial bone loss.',
    symptoms: [
      'Single or multiple missing teeth',
      'Loose or uncomfortable traditional dentures',
      'Difficulty chewing normal foods properly',
      'Desire for a permanent, non-removable tooth solution'
    ],
    features: [
      'Certified implantologist with 18+ years of expertise',
      'High-grade titanium implants with international bio-compatibility',
      'Precise surgical placement with minimal bone trauma',
      'Custom CAD/CAM screw-retained or cemented Zirconia crowns'
    ],
    duration: 'Minor painless procedure + healing osseointegration period'
  }
};

function initTreatmentModal() {
  const detailButtons = document.querySelectorAll('.open-treatment-modal');
  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-service');
      const data = TREATMENT_DETAILS[serviceKey];
      if (!data) return;

      let modalOverlay = document.getElementById('treatmentDetailModal');
      if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'treatmentDetailModal';
        modalOverlay.className = 'modal-overlay';
        document.body.appendChild(modalOverlay);
      }

      const symptomsHtml = data.symptoms.map(s => `<li><i class="fas fa-exclamation-circle" style="color: #f59e0b; margin-right: 6px;"></i> ${s}</li>`).join('');
      const featuresHtml = data.features.map(f => `<li><i class="fas fa-check-circle" style="color: #10b981; margin-right: 6px;"></i> ${f}</li>`).join('');

      modalOverlay.innerHTML = `
        <div class="modal-card" style="max-width: 600px;">
          <button class="modal-close-btn" onclick="closeTreatmentModal()">&times;</button>
          <span class="section-tag accent" style="margin-bottom: 0.5rem;">${data.badge}</span>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--primary-deep); margin-bottom: 0.75rem;">${data.title}</h3>
          <p style="color: var(--text-muted); font-size: 0.925rem; line-height: 1.6; margin-bottom: 1.25rem;">${data.description}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div style="background-color: var(--bg-page); border-radius: 8px; padding: 1rem; border: 1px solid var(--border-color);">
              <h5 style="font-size: 0.825rem; font-weight: 700; color: var(--primary-deep); margin-bottom: 0.5rem; text-transform: uppercase;">Indications:</h5>
              <ul style="list-style: none; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.35rem;">${symptomsHtml}</ul>
            </div>
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 1rem; border: 1px solid #bbf7d0;">
              <h5 style="font-size: 0.825rem; font-weight: 700; color: #166534; margin-bottom: 0.5rem; text-transform: uppercase;">Clinical Benefits:</h5>
              <ul style="list-style: none; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.35rem; color: #14532d;">${featuresHtml}</ul>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <a href="appointment.html" class="btn btn-primary" style="flex: 1;"><i class="fas fa-calendar-check"></i> Book Consultation (&#8377;200)</a>
            <button class="btn btn-secondary" onclick="closeTreatmentModal()">Close</button>
          </div>
        </div>
      `;

      modalOverlay.classList.add('active');
      modalOverlay.addEventListener('click', (ev) => {
        if (ev.target === modalOverlay) closeTreatmentModal();
      });
    });
  });
}

window.closeTreatmentModal = function() {
  const modal = document.getElementById('treatmentDetailModal');
  if (modal) modal.classList.remove('active');
};

/* ==========================================================================
   6. SCROLL TO TOP & CLIPBOARD
   ========================================================================== */
function initScrollTop() {
  const scrollBtn = document.querySelector('.scroll-top-btn');
  if (!scrollBtn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 350) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initClipboardButtons() {
  const copyBtn = document.getElementById('copyAddressBtn');
  if (!copyBtn) return;

  const addressText = "Shop No. GF-9, Ground Floor, Super Complex, Ranipur More, Near City Hospital / Opposite IDBI Bank, Jwalapur, Haridwar, Uttarakhand – 249407";

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(addressText).then(() => {
      showToast('Address copied to clipboard!');
    }).catch(() => {
      showToast('Ranipur More, Jwalapur, Haridwar – 249407');
    });
  });
}

function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-info-circle" style="color: #38bdf8;"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
