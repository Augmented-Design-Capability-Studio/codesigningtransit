// //----------Template by Alice Tang for CMU Codesigning Transit Project----------//
// //----------TIME MANIPULATION----------//

const T_INTERVAL = 10; // Corresponds to interval in time-based trigger
const DELTA_TIME = T_INTERVAL * 60 * 1000;

// Days of the week conversions
var week_days = {
  "Monday": 1, "Tuesday": 2, "Wednesday": 3,
  "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0
};

//---------DIARY STUDY PARAMETERS----------//
const diary_study_link = "https://example.qualtrics.com/form/FORM_ID_PLACEHOLDER";
const NUM_WEEKS = 2;
var contact_person = "RESEARCH_TEAM_NAME";
var contact_email = "study_contact@example.edu";

//----------TWILIO----------//
const scriptProperties = PropertiesService.getScriptProperties();
var TWILIO_ACCOUNT_SID = scriptProperties.getProperties()["TWILIO_ACCOUNT_SID"];
var TWILIO_AUTH_TOKEN = scriptProperties.getProperties()["TWILIO_AUTH_TOKEN"];

//-----------GOOGLE SHEET PROPERTIES----------//
const CODE_ = 15;
const NAME_ = 1;
const EDITURL_ = 16;
const COUNTER_ = 17;
const PLATFORM_ = 4;
const WEEK_ = 5;
const TIMEZONE_ = 6;
const EMAIL_B = 7;
const PHONE_B = 8;
const SENDTIME_BP = 9;
const SENDTIME_BE = 10;
const EMAIL_O = 11;
const SENDTIME_E = 12;
const PHONE_O = 13;
const SENDTIME_P = 14;

// Participant data placeholders
let c_name, c_code, c_week, c_platform, c_timezone, c_sendtime_p, c_sendtime_e, c_phone, c_email;

var responseSheet = SpreadsheetApp.getActiveSheet();
var googleFormUrl = responseSheet.getFormUrl();
var googleForm = FormApp.openByUrl(googleFormUrl);

//----------FORMATTING & CHECKING----------//

function formatTZ(timezone) {
  if (timezone.substr(0, 3) != "Can") {
    timezone = "US/" + timezone;
  }
  return timezone;
}

function emailTest() {
  var templ = HtmlService.createTemplateFromFile('Onboarding-Email');
  var changes = {
    name: "PARTICIPANT_NAME",
    chapterName: 'Diary Study',
    link: 'https://example.qualtrics.com/form/FORM_ID_PLACEHOLDER',
    noOfEvent: 'PLACEHOLDER_NO_EVENT',
    dayOfEvent: 'PLACEHOLDER_DAY_EVENT',
    timeOfEvent: 'PLACEHOLDER_TIME_EVENT',
    poweredBy: 'Research Team Name',
    chapterWebsite: 'https://example.org/study-info'
  };
  templ.changes = changes;
  message = templ.evaluate().getContent();

  MailApp.sendEmail({
    to: "participant@example.edu",
    subject: "Important Diary Study Onboarding Information",
    htmlBody: message
  });
}

function convert24(time) {
  if (time[1] == ":") time = "0" + time;
  if (time.substr(0, 2) == "12") time = "00" + time.substr(2);

  let time24 = parseInt(time.substring(0, 2));
  let minutes = time.substr(-9).substr(0, 6);
  if (time.substr(-2) == "PM") {
    time24 += 12;
    return time24 + minutes;
  } else {
    return time.substring(0, 8);
  }
}

function convert24Int(sendtime) {
  let newtime = convert24(sendtime);
  return [parseInt(newtime.substr(0, 2)), parseInt(newtime.substr(3, 5))];
}

function sendSMS(name, to, code, url) {
  var messages_url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  var payload = {
    MessagingServiceSid: "YOUR_MESSAGING_SERVICE_SID",
    To: to,
    Body: `Hello ${name}!\n\nThis is the research team reminding you to complete your diary study entry.\n\nParticipant code: ${code}.\nLink: ${diary_study_link}\nIf you have questions, contact ${contact_person} at ${contact_email}`,
    status_callback: "https://webhook.site/your-status-callback-url",
    From: "+10000000000"
  };

  var options = {
    method: "post",
    payload: payload,
    headers: {
      Authorization: "Basic " + Utilities.base64Encode(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN)
    }
  };

  UrlFetchApp.fetch(messages_url, options);
}

function sendEmail(p_name, p_email, p_code, p_url) {
  var templ = HtmlService.createTemplateFromFile('Reminder-Email');
  var changes = {
    name: p_name,
    emailAddress: p_email,
    chapterName: 'Diary Study',
    code: p_code,
    link: diary_study_link,
    url: p_url,
    noOfEvent: 'PLACEHOLDER_NO_EVENT',
    dayOfEvent: 'PLACEHOLDER_DAY_EVENT',
    timeOfEvent: 'PLACEHOLDER_TIME_EVENT',
    poweredBy: 'Research Team Name',
    chapterWebsite: 'https://example.org/study-info'
  };
  templ.changes = changes;
  message = templ.evaluate().getContent();

  MailApp.sendEmail({
    to: changes.emailAddress,
    subject: "[Study Team] Diary Study Reminder",
    htmlBody: message
  });
}
