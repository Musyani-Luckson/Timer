// Importing the hp object from the './helper/lib.js' file
import { hp } from './lib.js';
// Define the countDownTimer class
class countDownTimer {
	// Constructor to initialize properties
	constructor() {
		// Error messages
		this.errors = {
			date: `The DATE, must be Future Time`,
		};

		// Counter name and date/time properties
		this.counterName = `Developed By Musyani`;
		this.counterDate = ``;
		this.counterTime = ``;
		this.dateInString = ``;
		this.counterTimeInt = 0;
		this.clock = {};

		// DOM elements
		this.name = hp.getDom(`#name`);
		this.date = hp.getDom(`#date`);
		this.time = hp.getDom(`#time`);
		this.days = hp.getDom(`#days`);
		this.hours = hp.getDom(`#hours`);
		this.minutes = hp.getDom(`#minutes`);
		this.seconds = hp.getDom(`#seconds`);
		this.update = hp.getDom(`#update`);
		this.clockName = hp.getDom(`#clockName`);
		this.actualDate = hp.getDom(`#actualDate`);
		//
		this.sound = {}
	}
}

// Timer method for the countDownTimer class
countDownTimer.prototype.Timer = function () {
	// Check if the entered date is a future time
	const valid = isFutureTime(this.counterDate);
	if (valid) {
		// Update the countdown display at regular intervals
		const updateDisplay = () => {
			this.dateInString = formatDateToWords(this.counterDate, this.counterTime);
			this.clock = countdownToTargetDate({
				targetDate: this.counterDate,
				targetTime: this.counterTime
			});
			//
			this.showCountDown();
			let key = this.clock.seconds
			if (this.sound[key] == undefined) {
				// stop sound
				this.soundEffects(`tickA`, false)
				this.sound = {}
				// start sound
				this.sound[key] = 'sound';
				this.soundEffects(`tickA`, true)
			}
		};
		// Start updating the countdown display with an interval of -1 (runs as fast as possible)
		const intervalId = setInterval(updateDisplay, -1);
	} else {
		this.upDateStoredValues()
		// Show an alert if the entered date is not a future time
	}
};

// Method to get the input values
countDownTimer.prototype.values = function () {
	const storedValues = this.storedValue()
	return storedValues
};

countDownTimer.prototype.upDateStoredValues = function (values) {
	hp.browserStorageUse('delete', `counterTime`, localStorage)
	hp.browserStorageUse(
		'post',
		'counterTime',
		localStorage,
		{
			name: this.name.value,
			date: this.date.value,
			time: this.time.value
		}
	)
	let value = hp.browserStorageUse('get', 'counterTime', localStorage)[0]
	this.addValues(value);
};

countDownTimer.prototype.storedValue = function () {
	let value = hp.browserStorageUse('get', 'counterTime', localStorage)
	if (value.length === 0) {
		hp.browserStorageUse(
			'post',
			'counterTime',
			localStorage,
			{
				name: this.name.value,
				date: this.date.value,
				time: this.time.value
			}
		)
		value = hp.browserStorageUse('get', 'counterTime', localStorage)
	} else {
		// localStorage.clear()
	}
	value = hp.browserStorageUse('get', 'counterTime', localStorage)
	return value[0]
};

// Method to set counterName, counterDate, and counterTime properties
countDownTimer.prototype.addValues = function (value) {
	this.counterName = value.name;
	this.counterDate = value.date;
	this.counterTime = value.time;
};

// Method to handle countdown evaluation
countDownTimer.prototype.evaluate = function () {
	const values = this.values();
	this.addValues(values);
	this.Timer();
	this.handleCounter();
};

// Method to update the countdown display on the UI
countDownTimer.prototype.showCountDown = function () {
	hp.setInnerText(this.days, this.clock.days);
	hp.setInnerText(this.hours, this.clock.hours);
	hp.setInnerText(this.minutes, this.clock.minutes);
	hp.setInnerText(this.seconds, this.clock.seconds);
	hp.setInnerText(this.clockName, this.counterName);
	hp.setInnerText(this.actualDate, this.dateInString);
};
// Method to handle counter updates on user interaction
countDownTimer.prototype.handleCounter = function () {
	hp.eventListener(this.update, `click`, () => {
		const values = this.values();
		const { name, date, time } = values;
		const valid = isFutureTime(date);
		if (valid) {
			this.addValues(values);
			this.upDateStoredValues()
		} else {
			alert(this.errors.date);
		}
	});
};

// Create an instance of the countDownTimer class
const cdt = new countDownTimer();
// Evaluate the countdown timer
cdt.evaluate();

// Function to check if the given date is in the future...
function isFutureTime(dateString) {
	const givenDate = new Date(dateString);
	const currentDate = new Date();
	if (givenDate > currentDate) {
		return true;
	} else {
		return false;
	}
}

// Function to add a leading zero to a number if needed
function addLeadingZero(number) {
	return number.toString().padStart(2, '0');
}

// Function to calculate the countdown to the target date
function countdownToTargetDate(data) {
	const { targetDate, targetTime } = data;
	const timeValues = convertTimeToObj(targetTime);

	const time = new Date(targetDate).getTime();
	const now = new Date().getTime();
	const timeRemaining = time - now;
	if (timeRemaining <= 0) {
		// If the countdown has ended, stop updating the display
		clearInterval(countdownInterval);
		console.log("Countdown has ended!");
		return;
	}
	let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
	let hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

	// Adjust hours and days based on the time values
	const min = intervalExtractor(
		60,
		timeValues.minutes + minutes
	);
	minutes = min.remainder;
	hours += min.quotient;
	const hour = intervalExtractor(
		24,
		timeValues.hours + hours
	);
	hours = hour.remainder;
	days += hour.quotient;

	return {
		days: addLeadingZero(days),
		hours: addLeadingZero(hours),
		minutes: addLeadingZero(minutes),
		seconds: addLeadingZero(seconds),
	};
}

// Function to convert a time string into an object with hours and minutes
function convertTimeToObj(timeStr) {
	const [hour, minutes] = timeStr.split(':').map(Number);
	return { hours: hour, minutes: minutes };
}

// Function to extract the quotient and remainder of a division
function intervalExtractor(time, maxIntaval) {
	return {
		quotient: Math.floor(maxIntaval / time),
		remainder: maxIntaval % time,
	};
}

// Function to format the date and time into words print
function formatDateToWords(date, time) {
	date = new Date(date);
	const year = date.getFullYear();
	const month = date.toLocaleString('default', { month: 'long' });
	const day = date.toLocaleString('default', { weekday: 'long' });

	const dayNumber = date.getDate();
	const formattedDay = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
	const stringDate = `${day} ${formattedDay} ${month} ${year} at ${time}`;
	return stringDate
}

countDownTimer.prototype.soundEffects = function (sound, state) {
	const src = [`./${sound}.mp3`];
	const audio = new Howl({
		src: src,
	});
	if (state == true) {
		audio.play()
	} else {
		audio.stop()
	}
	setTimeout(function () {
		audio.stop();
	}, 500);
};
