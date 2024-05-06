const categories = [
	"confidence interval for a population mean",
	"confidence interval for a proportion",
	"confidence interval for the difference between two means (independent samples)",
	"confidence interval for paired data (dependent samples)",
	"confidence interval for the difference between 2 proportions",
	"prediction for a single value of y for a fixed x",
	"hypothesis test for a population mean",
	"hypothesis test for a population proportion",
	"hypothesis test for the difference between 2 means (independent samples)",
	"hypothesis test for the paired data (dependent samples)",
	"hypothesis test for the difference between 2 proportions",
	"chi-square goodness of fit test",
	"chi-square test for independence",
	"chi-square test for homogeneity",
	"one-way <abbr title='analysis of variance'>anova</abbr> test",
];

$(document).ready(() => {
	$("#categories").append("<h3>select the categories you want to work on</h3>");
	categories.forEach((x, i) => $("#categories").append(`<div class="form-check"> <input category="${i}" class="form-check-input category-checkbox" type="checkbox"> <label class="form-check-label" onclick="$('[category=${i}]').click()">${x} </label> </div>`));
	$("#categories").append("<div class='btn-group mt-3'> <button id='categoriesSelectAll' class='btn btn-outline-primary'>all</button> <button id='categoriesSelectNone' class='btn btn-outline-primary'>none</button> <button class='btn btn-success' onclick='go()'>go</button> </div>");

	$("#categoriesSelectAll").click(() => categories.forEach((x, i) => $(".category-checkbox").prop("checked", true)));
	$("#categoriesSelectNone").click(() => categories.forEach((x, i) => $(".category-checkbox").prop("checked", false)));
});

function go() {
	let selectedCategories = $(".category-checkbox:checked").toArray().map(x => +x.attributes.category.value);
	let questionBank = questions.filter(q => selectedCategories.indexOf(q.category) != -1);

	$("#categories").remove();
	$("#question").show();
	selectedCategories.forEach(i => $("#answerOptions").append(`<div class="form-check"> <input category="${i}" class="form-check-input answer-radio" type="radio" name='answer'> <label class="form-check-label" onclick="$('[category=${i}]').click()">${categories[i]} </label> </div>`));

	askQuestion(selectedCategories, questionBank);
}

async function askQuestion(categories, questionBank) {
	if (!questionBank.length) return alert("You've answered all the questions in the selected categories!");

	let question = questionBank[Math.floor(Math.random() * questionBank.length)];

	$("#questionText").html(question.question);
	$(".answer-radio").prop("disabled", false);
	$(".answer-radio").prop("checked", false);
	$("#response").html("");
	$("#nextQuestion").prop("disabled", true);

	await guessLoop(question);
	$(".answer-radio").prop("disabled", true);
	await waitForContinue();
	askQuestion(categories, questionBank.filter(x => x.question != question.question));
}

async function guessLoop(question) {
	let selected = await waitForRadio();
	$("#response").html(processAnswer(question.category, selected));
	if (question.category == selected) $("#nextQuestion").prop("disabled", false);
	else await guessLoop(question);
}
const waitForRadio = async () => new Promise(resolve => $("#answerOptions").on("change", "input", () => resolve(+$("input:checked").attr("category"))));
const waitForContinue = async () => new Promise(resolve => $("#nextQuestion").click(() => resolve()));

function processAnswer(correct, guess) {
	if (correct == guess) return "nice! press next to move on to the next question.";
	if (correct < 6) { // not a confidence interval
		if (guess > 5) return "this is not a hypothesis test, since you want to estimate something."; // guessed confidence interval
		else if (correct < 2) { // one sample
			if (guess < 1) return "notice that there is only one sample here."; // guessed two samples
			else if (correct == 0) return "the variable is quantitative, not yes/no.";
			else return "the variable is not quantitative; it is a yes/no question.";
		} else if (guess < 2) return "there are two samples here, not one.";
		else if (correct == 4) return "the variables are not quantitative; they are yes/no questions.";
		else if (guess == 4) return "the variables are quantitative, not yes/no.";
		else if (correct == 2) return "the two populations are not dependent; there is no pairing.";
		else if (correct == 3) {
			if (guess == 5) return "we are not given a value for one of the variables.";
			else return "the data is paired here. the variables are dependent.";
		} else return "we are given a value for one of the variables and want to estimate the other."
	} else if (guess < 6) return "notice that we want to make a decision, not estimate a value. this is not a confidence or prediction interval.";
	else if (correct < 8) {
		if (guess > 7) return "there is only one sample here.";
		else if (correct == 6) return "the variable is quantitative, not yes/no.";
		else return "the variable is not quantitative; it is a yes/no question.";
	} else if (guess < 8) return "there is more than one sample here.";
	else if (correct < 11) {
		if (guess == 14) return "there are only two samples here. 1-way anova is used for more than two samples.";
		else if (guess > 10) return "this is not a chi-square test.";
		else if (correct == 10) return "the variables are not quantitative; they are yes/no questions.";
		else if (guess == 10) return "the variables are quantitative, not yes/no.";
		else if (correct == 8) return "the two populations are not dependent; there is no pairing.";
		else if (correct == 9) return "the two populations are dependent; the data is paired.";
	} else if (correct == 14) return "notice that there are more than two variables here.";
	else if (guess == 14) return "there are not more than two variables here.";
	else if (correct == 11) {
		if (guess == 12) return "notice that we are testing for a distribution, not independence.";
		else if (guess == 13) return "there is only one sample here. we are comparing it with a known distribution."
		else return "this is a chi-square test.";
	} else if (correct == 12) {
		if (guess == 11 || guess == 13) return "we are not interested in whether the distribution or distributions are as we predicted."
		else return "this is a chi-square test.";
	} else {
		if (guess == 11) return "we do not have a known distribution. we are comparing two distributions with only the sample data of each.";
		else if (guess == 12) return "notice that we are testing to see if the distributions are the same, not to see if the variables are independent.";
		else return "what test compares two distributions?"
	}
}