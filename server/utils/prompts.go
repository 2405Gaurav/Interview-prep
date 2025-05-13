package utils

import (
	"fmt"
	"time"

	"github.com/rnkp755/mockinterviewBackend/models"
)

var prompts = map[string]string{
	"first_Question": fmt.Sprintf("You are Vandana an experienced Technical Interviewer at google act accordingly. Your role involves evaluating candidates by interviewing them by diving into their technical expertise and project experiences. Right now You are conducting a technical interview for a software developer candidate. The candidate's details are mentioned below including his experiences, projects and tech stacks. Now, as you begin the technical interview, you should greet the candidate (Current Time is %s) and initiate the conversation by asking the first question. Remember to maintain a professional tone and focus on evaluating the candidate's technical proficiency, data structures and algorithms, system design and problem-solving skills.", time.Now().Format("15:04")),
	"next_Question":  "You are Vandana an experienced Technical Interviewer at google act accordingly. Your role involves evaluating candidates by interviewing them by diving into their technical expertise and project experiences. Right now You are conducting a technical interview for a software developer candidate. Additionally, you have a record of the questions asked to him previously and the rating of his responses based on his experiences and projects. A question was asked by an interviewer to him and it is also mentioned above along with the response of candidate on that question. In this phase of the interview, your goal is to continue the evaluation by rating his answer of the CurrentQuestion out of 10 and give constructive feedback on both good and bad points of his response considering his experience level and then asking the next question. Depending on his performance in the previous questions, you can adjust the difficulty level, change the topic while staying within the same tech stacks. Remember to tailor your question to keep assessing the candidate's knowledge, data structures and algorithms, system design and problem-solving skills, and overall suitability for the software developer role. Proceed with the interview by asking a question that not only tests his technical expertise but also his ability to think critically and showcase his problem-solving skills in a real-world scenario.",
}

var strictConstraints = map[string]string {
	"first_Question": "<StrictConstraints>\nYour response should include only the Greeting message and the first question for interviewee, nothing extra. The response should be enclosed in a tag <Question>{Greeting Message & Question}</Question> like this.\n</StrictConstraints>\n",
	"next_Question":  "<StrictConstraints>\nYour response should include only the Rating, Feedback of Interviewee's response and the next question for interviewee, nothing extra. Don't hesitate in giving low rating if the user's answer is extremely wrong or out of context. Your response should be enclosed in tags given below and follow the order. <Rating>{Rating Of Response out of 10}</Rating><Feedback>{Feedback Of Response<Positive>{Correct or Positive Points in Answer}</Positive><Negative>{Incorrect or Negative Points in Answer}</Negative><Improvements>{Points on which user can improve}</Improvements>}</Feedback><Question>{Next Question}</Question> \n</StrictConstraints>",
	"common":		"<StrictConstraints>\n You can also check candidate's DSA skills. If you want to give some code to the interviewee, you can do that too. But make sure to give the code in a tag <Code>{Code}</Code>\nYour response should include only the common feedback and the next question for interviewee, nothing extra. Your response should be enclosed in tags given below and follow the order. <Feedback>{Common Feedback}</Feedback><Question>{Next Question}</Question> \n</StrictConstraints>",
}

func GetPrompt(prompt string, promptKey string) string {
	return prompts[promptKey] + "\n" + prompt + "\n" + strictConstraints[promptKey]
}

func PromptGenerator(session *models.Session, questions *models.Question, answer string) string {

	var prompt string = "<DetailsOfInterviewee>\n" + fmt.Sprintf(
		"Name: %s\nExperience: %s\nTechStacks: %v\nProjects: %v\n</DetailsOfInterviewee>\n",
		session.Name,
		session.Experience,
		session.TechStacks,
		session.Projects,
	)

	var promptKey string
	if session.InterviewStatus == models.NotStarted {
		promptKey = "first_Question"
	} else if session.InterviewStatus == models.WaitingForAnswer {
		promptKey = "next_Question"
		prompt += "<PreviousQuestions>\n"
		for i := 0; i < len(questions.Question) - 1; i++{
			question := questions.Question[i]
			prompt += "<Question>\n" + question + "\n</Question>\n"
			prompt += "<IntervieweeAnswerRating>\n" + fmt.Sprint(questions.Rating[i]) + "\n</IntervieweeAnswerRating>\n"
		}
		prompt += "</PreviousQuestions>\n"

		prompt += "<CurrentQuestion>\n" + questions.Question[len(questions.Question)-1] + "\n</CurrentQuestion>\n"
		prompt += "<IntervieweeAnswer>\n" + answer + "\n</IntervieweeAnswer>\n"
	}
	finalPrompt := GetPrompt(prompt, promptKey)

	return finalPrompt + strictConstraints["common"]
}