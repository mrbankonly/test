const Mail = require("nodemailer");
const fs = require("fs");
const sendOtpLog = require("./data-set.json");

let transporter = null;
let minutePerRequest = 1;
let maxTimeVerify = 1;

const mailConfig = ({ email, service, password, limitMinutePerRequest = 1, maxTimeVerifyAvailable = 3 }) => {
	transporter = Mail.createTransport({
		service: service,
		auth: {
			user: email,
			pass: password,
		},
	});
	minutePerRequest = limitMinutePerRequest;
	maxTimeVerify = maxTimeVerifyAvailable;
};

const send = async ({ to, text = "Greeting!!", subject = "SUBJECT", from = null, otpCode, link, enableLog = true, tooManySendMessage, toVerified }) => {
	if (!transporter) throw new Error(`Invalid configuration mailConfig`);
	const mailSendOption = {
		from: from == null ? process.env.MAIL_ID : from,
		to: to,
		subject: subject,
		text: text,
		html:
			link ||
			`
      <h3>Your verify code</h3>
      <h1>${otpCode}</h1>
      `,
	};

	if (enableLog) {
		const now_date = new Date();
		const logData = {
			email: to,
			created_at: now_date.getTime(),
			otpCode,
			isVerified: false,
		};
		let created_at = logData.created_at;
		const emailIndex = sendOtpLog.findIndex((e) => e.email === to);
		if (emailIndex !== -1) {
			created_at = sendOtpLog[emailIndex].created_at;
			const minutes = Math.floor((logData.created_at - created_at) / 60000);
			if (minutes >= minutePerRequest) {
				sendOtpLog[emailIndex].created_at = logData.created_at;
				sendOtpLog[emailIndex].otpCode = otpCode;
			} else {
				if (!toVerified) {
					throw new Error(`400-MAIL429::${tooManySendMessage || `Please wait after ${minutePerRequest} minutes and try again`}`);
				}
			}
		} else {
			sendOtpLog.push(logData);
		}

		fs.writeFileSync(__dirname + "/./data-set.json", JSON.stringify(sendOtpLog));
	}
	try {
		const sendMail = await transporter.sendMail(mailSendOption);
		if (sendMail.error) throw new Error("Mail failed");
	} catch (error) {
		console.log(error.message);
		throw new Error(`400::MAILER500`);
	}
};

function verifyOtp({ email, otpCode, throwError = false }) {
	const emailIndex = sendOtpLog.findIndex((e) => e.email === email);
	if (emailIndex === -1) {
		if (throwError) throw new Error(`400-MAILER0001::Request failed`);
		return false;
	}

	const now_date = new Date();
	let created_at = sendOtpLog[emailIndex].created_at;
	const minutes = Math.floor((now_date.getTime() - created_at) / 60000);

	if (minutes >= maxTimeVerify) {
		if (throwError) throw new Error(`400-MAILER0003::Request failed`);
		return false;
	}

	storedOtp = sendOtpLog[emailIndex].otpCode;

	if (otpCode !== storedOtp) {
		if (throwError) throw new Error(`400-MAILER0004::Request failed`);
		return false;
	}

	sendOtpLog[emailIndex].isVerified = true;
	fs.writeFileSync(__dirname + "/./data-set.json", JSON.stringify(sendOtpLog));

	return true;
}

function clearLogData() {
	fs.writeFileSync(__dirname + "/./data-set.json", JSON.stringify([]));
}

function isVerified(email) {
	const emailIndex = sendOtpLog.findIndex((e) => e.email === email);
	if (emailIndex === -1) return false;
	return sendOtpLog[emailIndex].isVerified;
}

function setVerifiedValue(email, value) {
	const emailIndex = sendOtpLog.findIndex((e) => e.email === email);
	if (emailIndex === -1) return false;
	sendOtpLog[emailIndex].isVerified = value || false;
	fs.writeFileSync(__dirname + "/./data-set.json", JSON.stringify(sendOtpLog));
}

const Mailer = {
	mailConfig,
	send,
	sendOTPLog: require("./data-set.json"),
	clearLogData,
	verifyOtp,
	isVerified,
	setVerifiedValue,
};
module.exports = Mailer