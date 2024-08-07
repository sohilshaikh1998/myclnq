export default {
  call_type: {
    video: 'Video Call',
    audio: 'Audio Call',
    house: 'House Call',
    vid: 'Video',
    teleArt: 'Tele-ART',
    aud: 'Audio',
    inHou: 'House\nCall',
    tele: 'Tele',
    thirtyMin: 'Duration 30 Min',
    twentyMin: 'Duration 20 Min',
    forVideo: 'for video call ',
    forAudio: 'for audio call ',
  },
  appoitmentStatus: {
    waiting_clinic: 'Awaiting Clinic Confirmation',
    waiting_user: 'Awaiting Your Confirmation',
    cancelled: 'CANCELLED',
  },
  paymentStatus: {
    wavedOff: 'Waived Off',
  },
  alertTitle: {
    cancelAppt: 'Cancel Appointment',
    galPermission: 'MyCLNQ app requires gallery permission',
    locPermission: 'Location permission denied',
    paySuccess: 'Payment Successful!',
    payFailed: 'Payment Failed',
    sorry: 'Sorry',
    location: 'Location',
    confirmReschedule: 'Confirm Rescheduling',
    consultationCompleted: 'Consultation completed',
    userLoggedOut: 'User Logged Out',
    attention: 'Attention!',
  },
  alertMsg: {
    cancelAppt: 'Are You sure to cancel this appointment ?',
    invoiceSend: 'Invoice has been sent to {{email}}. Kindly Check',
    galPermission: 'We require gallery permission in order to save {{name}} in your device ',
    medCertDownload: 'Medical Certificate is downloaded would you like to open',
    medCertNotDownload: 'Medical Certificate not downloaded',
    paySuccess:
      'Please be available on time for consultation. Telemedicine rules & regulations will be send to you on your registered Email Id. Thanks !',
    cantPay: "You can't pay your appointment amount, please try again later!",
    requestConfirmed: 'This appointment request is already confirmed',
    requestExpired: 'Sorry, This appointment request already expired',
    requestCancelled: 'Sorry, This appointment request already Cancelled',
    requestRejected: 'Sorry, This appointment request already Rejected',
    noClinicDetails: "Clinic doesn't have any details",
    advanceBookingNotAllowed: 'Advance booking is not allowed for this clinic',
    noAdvanceBookingAllowed: 'No advance booking allowed for this hospital. Please come back on next working day',
    bookingNotAllowedForDate: 'Booking is not allowed on this date. Please book appointment within {{days}} days from today',
    bookingNotAllowed: 'Booking is not allowed on this date. Please book appointment on earliest available date',
    selectConsultType: 'Plese select type of remote consultation',
    noFutureRequest: 'Can not request for future dates',
    docWorkComplete: 'Doctor working hours is completed, Please Select the new date to proceed',
    chooseSlotTime: 'Please choose appointment slots starting from {{time}} for chosen date.',
    cannotRaiseRequest: "You can't raise appointment request for next 1 hours from current time",
    selectSlot: 'Please select a slot',
    noSlots: 'No slots because doctor is not Available',
    noSlotSelctionNextSixtyMin: 'Selecting slot within next 60 mins is not allowed',
    bookAppointBeforeOneHour: 'Please book the appointment before 1 hour of this session',
    fileDownloadedOpen: '{{name}} is downloaded would you like to open',
    allowNearClinic: 'Please allow the location permission to see nearby clinics',
    allowPermissionSetting: 'Please provide location permissions in application settings & restart app to to see nearby clinics',
    exit: 'Exiting MyCLNQ',
    locPermissionForClinic: 'Please provide location permission to get your near by clinics',
    turnGPSOn: 'Please Turn on GPS to see the clinics',
    couldNotFindClinic: "We couldn't find any clinic within the maximum range",
    numberNotBelongsCountry: 'Your number not belongs to the country you are trying to book appointment.',
    selectSlotThirtyMin: 'Selecting slot within next 30 mins is not allowed',
    selectSlotReschedule: 'Please select a slot to reschedule',
    confirmReschedule: 'Are you sure you want to reschedule this appointment?',
    appointConfirmed: 'This appointment request is already confirmed',
    deliveryAlert:
      'We have got your request. We will deliver medicine within 4-5 hours.Please make cash payment for Medicine Cost+ $10 delivery. Thanks',
    prescriptionSaved: 'Prescription saved Successfully',
    consultationCompleted: 'Consultation you are trying to join is already completed, please contact clinic for any query.',
    consultaionNotStarted: 'Consultation not yet started, please wait or contact clinic to start the consultation',
    loginFirst: 'Please Login first to view details.',
    checkConnection: 'Please check you connection',
    regulatoryGuideLines:
      '\n I give consent to avail consultation via telemedicine and ready to share real identity name, age, address, email ID, phone number or any other identification as may be deemed to be appropriate. The consultation would be record and save encrypt format as per local regulatory guideline.',
    patientDetailsMissing: 'Sorry, Selected patient details is missing, Please Update in profile ',
  },
  button: {
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    capCancel: 'CANCEL',
    open: 'Open',
    ok: 'Ok',
    closed: 'Closed',
    clinicClosed: 'Clinic Closed',
    specialities: 'Specialities',
    proceed: 'Proceed',
    east: 'East',
    west: 'West',
    north: 'North',
    south: 'South',
    apply: 'Apply',
    remove: 'Remove',
    discount: 'Discount',
    payNow: 'PAY NOW',
    hideDetails: 'Hide Details',
    viewDetails: 'View Details',
    downloadEPrescription: 'Download E-Prescription',
    donotAllow: "Don't Allow",
    allow: 'Allow',
    gotIt: 'Got It',
    search: 'Search',
    myAppointment: 'My Appointments',
    rescheduleNow: 'Reschedule Now',
    reschedule: 'Reschedule',
    capSend: 'SEND',
    send: 'Send',
    applyCoupon: 'Apply Coupon',
    next: 'Next',
    capResult: 'REJECT',
    invoice: 'Invoice',
    capReschedule: 'RESHEDULE',
    joinCall: 'JOIN CALL',
    seeMore: 'See More',
    request: 'Requests',
    upcoming: 'Upcoming',
    past: 'Past',
    loging: 'Login',
    previous: 'Previous',
    submit: 'Submit',
    addUser: 'Add User',
    findDoctors: 'Find Doctors',
    capNo: 'NO',
    capYes: 'YES',
    capContinue: 'CONTINUE',
    capVerifying: 'Verifying',
    addNew: 'Add New',
    add: 'ADD',
    goBack: 'GO BACK',
    bookNow: 'BOOK NOW',
    camelAdd: 'Add',
    continue: 'Continue',
    videoConsult: 'Video Consult',
    completeProfileBtn:'Complete Profile',
    delete: 'Delete',
  },
  text: {
    appontDetail: 'Appointment Details',
    fewMoreDoc: 'Hello, here are few more doctors with same speciality available earlier than {{name}}',
    bookingOn: 'Booking on',
    clinicNotOpened: 'Clinic Not Yet Opened',
    clinicWorkingNotStart: 'Clinic working hours not yet started',
    clinicWorkCompleted: 'Clinic working hours are completed. Please try booking during clinic working hours',
    noDocAvail: 'No Doctors available on this day',
    clinicClosed: 'CLINIC CLOSED !!!',
    selectDoc: 'Select Doctor',
    selectFilter: 'Select Filters',
    clinicCloseNextWorkDay: '{{clinicName}} is closed on {{date}}. Next Working day of the clinic is ',
    clinicNameClosed: '{{clinicName}} is closed',
    docNotAvail: 'DOCTOR NOT AVAILABLE TODAY !!!',
    docNotAvailDate: 'Doctor is not available on {{date}}. Next Working day of the doctor is ',
    docNextWorkDayNotAvailTryAgain: "Doctor's Next working day is not available. Please try again later. ",
    selectSlot: 'Select Your Slot',
    bookBeforeSixty: "*You can Book today's slots only before 60 mins of the session starting time",
    docNotAvailToday: 'DOCTOR NOT AVAILABLE TODAY !!!',
    optRemoteConsult: 'Opt-Remote Consultation',
    optVideoConsult: 'Opt-Video Consultation',
    optAudioConsult: 'Opt-Audio Consultation',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    docTodayWorkComplete: ' *Doctor today working hours is completed. Please select new date to proceed',
    clinicBookingNotAvailCall: 'For this clinic the booking appointment is not available. Please call {{number}} to book your appointment. Thanks',
    session: '(Session {{index}})',
    prescriptionReadyCollect: 'Your prescription is ready, please collect the medicine from the clinic. Thanks',
    orderExpiredNoPayment: 'Your order has been expired due to no payment within allocated time. Thanks',
    prescriptionReadyMakePyamentCollectMedicine:
      'Your prescription is ready, please make the payment before {{time}} and collect the medicine from the clinic. Thanks',
    prescriptionReadyMakePyament:
      'Your prescription is ready, please make the payment before {{time}} and medicine will be deliver at your doorstep within 4-6 hours. Thanks',
    paymentReceivedCollectMedicine: 'We received your payment, please collect medicine from the clinic.',
    paymentReceivedMedicineWillDelivered: 'We received your payment and medicine will be deliver at your doorstep within 4-6 Hours',
    medicineWillDeliver: '{{name}} will deliver the medicine at your doorstep within 3-5 hours.',
    pleaseShareOTP: 'Please share this OTP {{otp}} with a delivery partner to confirm the delivery.',
    medicineDelivered: 'Your medicine has been successfully delivered on {{date}} at {{time}} by {{name}}',
    otp: 'OTP for medicine delivery {{otp}}',
    enterCouponCode: 'Enter Coupon Code',
    couponApplied: 'Coupon Applied',
    couponSaving: 'Coupon Saving ',
    orderDetails: 'Order Details',
    totalPrice: 'Total Price',
    deliveryCharges: 'Delivery Charges',
    otherCost: 'Other Cost',
    couponDiscount: 'Coupon Discount',
    totalAmount: 'Total Amount',
    notDownloaded: '{{name}} not downloaded',
    pleaseEnterCouponCode: 'Please Enter Coupon Code. ',
    couponAppliedSuccess: 'Coupon Code Applied Successfully.',
    courseDetail: 'Course Details',
    enterLocation: 'Enter the Location',
    currentLocation: 'Current location',
    docClinicSpec: 'Doctor/Clinic/\nSpeciality',
    approxWaitingTime: 'Approx Waiting time is {{minutes}} mins',
    appointRechedule: "Hi {{name}}, we've rescheduled your appointment.",
    nextOperatingDay: 'Next operating day of the doctor is',
    doctorNotWorkingToday: 'Doctor is not working today !!!',
    docNextWorkDayNotAvail: "Doctor's Next Working Day is Not available",
    selectYourSlotForReschedule: 'Select Your Slot for Rescheduling',
    noRequestAppoint: "Sorry, you don't have any request appointments",
    noUpcomingAppoint: "Sorry, you don't have any Upcoming appointments",
    typeMsg: 'Type Your Message here... ',
    rejectMsg: 'You are about to reject an appointment, Please Specify the reason below to initiate communication',
    doctorNotes: 'Doctor Notes',
    checkDetails: 'Check Details',
    ePrescriptionPayment: 'E-Prescription Payment',
    waitingTime: 'Waiting Time (Approx.) : ',
    endsIn: 'ENDS IN',
    noPastAppoint: "Sorry, you don't have any Past appointments",
    noNotifToDisplay: 'No Notifications to display !!!',
    selectSpeciality: 'Please select speciality',
    selectClinicHospital:" Select Clinic / Hospital",
    selectWithinOneHour: 'Selecting request within 1 hours is not allowed',
    selectWithinThirtyMinutes: 'Selecting request within 30 minutes is not allowed',
    pleaseSelectDoc: 'Please select doctor',
    selectRelative: 'Please select relative',
    firstName: 'First Name',
    lastName: 'Last Name',
    dob: 'Date Of Birth',
    email: 'E-Mail ID',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    height: 'Height',
    weight: 'Weight',
    optional: 'Optional',
    selectRelation: 'Select Relation',
    relation: 'Relation',
    insuranceNotAvail: 'Insurance Company name is not available',
    videoConsult: 'video consultation',
    audioConsult: 'audio consultation',
    inHouseConsult: 'in-house consultation',
    appointSubmitSuccess:
      'Hello {{name}}, Your Appointment request for {{type}} has been submitted successfully, clinic Personnel will get back to you.',
    trackRequest: 'Track Request',
    consultType: 'Consultation Type',
    selectSpe: 'Select Speciality',
    docNotAvail: 'No Doctor Available',
    sess: 'Sessions',
    dobInvalid: 'Date of birth you selected is invalid',
    selectPatient: 'Select Patient',
    addSymp: 'Add Symptoms (Max 25 Char)',
    selectSymptoms: 'Select Or Add Symptoms',
    notMoreThenEightSymp: "You can't add more than 8 symptoms",
    insuranceNumNotAvail: 'Insurance number not available',
    clickToSelectPatient: 'Click here to select an existing patient',
    noProfileFound: 'No profiles found.Please fill the details',
    insuranceHolder: 'Insurance Holder ?',
    insuranceNum: 'Insurance Number',
    gotConfirmAppoint: "Hi {{name}} , we've got you confirmed for your appointment.",
    appontRequestSubmitSuccess:
      'Hello {{name}}, Your Appointment request {{type}} has been submitted successfully , clinic Personnel will get back to you.',
      fileDownloadedOpen: '{{name}} is downloaded would you like to open',
  },
  helpTour: {
    clinicNearBy: 'CLINICS NEARBY',
    findClinics: 'Find clinics close to your location and book appointment.',
    guaranteAppoint: 'GUARANTEED APPOINTMENTS ',
    viewDoctorSlot: "View doctor's free slots and instantly book appointments.",
    beatQueue: 'BEAT THE QUEUE',
    getNotif: 'Get notifications on queue status,wait in the queue virtually and beat the queue',
    letStart: "Let's Start",
    next: 'Next',
    medicalServices:'MEDICAL SERVICES',
    remoteMonitoring:'REMOTE MONITORING',
    manageappointments:'Manage appointments, join video calls from the comfort of your home.',
    qualityHealth:'Provides quality health care services with facilities for consultation, diagnostics, health checks & more.'

  },
  doctorSuggestion: {
    generalPhy: 'General Physician',
    cancer: 'Cancer',
    ortho: 'Ortho',
    dental: 'Dental',
    cardio: 'Cardio',
    gynae: 'Gynae',
    pain: 'Pain',
  },
};