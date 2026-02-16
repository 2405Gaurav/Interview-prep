package utils

import (
	"fmt"
	"strings"
	"time"

	"github.com/rnkp755/mockinterviewBackend/models"
)

// Define constants for static parts of the prompt to avoid re-allocation
const (
	persona = `You are Vandana, an experienced Technical Interviewer at Google. 
Your role is to evaluate candidates by diving into their technical expertise, data structures, algorithms, and system design skills.
Maintain a professional tone.
`

	// XML Format instructions
	constaintFirstQuestion = `
<StrictConstraints>
1. You must start with a Greeting (Current Time: %s).
2. Ask the first technical question based on the candidate's stack.
3. Your output must strictly follow this XML format (no markdown outside tags):
<Question>
{Greeting message and the First Question}
</Question>
<Code>
{Optional: Only if you need to provide a code snippet for the question, otherwise leave empty}
</Code>
</StrictConstraints>
`

	constraintNextQuestion = `
<StrictConstraints>
1. Evaluate the candidate's answer to the <CurrentQuestion> provided above.
2. Provide a Rating out of 10.
3. Provide constructive Feedback (Positive, Negative, Improvements).
4. Ask the Next Question. 
5. If the user's answer was extremely poor or irrelevant, give a low rating.
6. Your output must strictly follow this XML format (no markdown outside tags):
<Rating>{Integer 0-10}</Rating>
<Feedback>
  <Positive>{What they did right}</Positive>
  <Negative>{What they did wrong}</Negative>
  <Improvements>{How to optimize}</Improvements>
</Feedback>
<Question>{The Next Question}</Question>
<Code>{Optional: Code snippet for the next question if needed}</Code>
</StrictConstraints>
`
)

// buildCandidateDetails creates the context block for the interviewee
func buildCandidateDetails(session *models.Session) string {
	return fmt.Sprintf(`
<DetailsOfInterviewee>
Name: %s
Experience: %s
TechStacks: %v
Projects: %v
</DetailsOfInterviewee>
`, session.Name, session.Experience, session.TechStacks, session.Projects)
}

func PromptGenerator(session *models.Session, questions *models.Question, answer string) string {
	var sb strings.Builder

	// 1. Add System Persona
	sb.WriteString(persona)

	// 2. Add Candidate Details
	sb.WriteString(buildCandidateDetails(session))

	// 3. Handle Logic based on Interview Status
	if session.InterviewStatus == models.NotStarted {
		// --- First Question Flow ---
		
		// Inject dynamic time into the constraint
		currentTime := time.Now().Format("15:04")
		sb.WriteString(fmt.Sprintf(constaintFirstQuestion, currentTime))

	} else if session.InterviewStatus == models.WaitingForAnswer {
		// --- Follow-up Question Flow ---

		// A. Add Context (Previous Q&A History)
		// We iterate up to len-1 because the last question is the "Current" one being answered
		if questions != nil && len(questions.Question) > 0 {
			sb.WriteString("<History>\n")
			for i := 0; i < len(questions.Question)-1; i++ {
				sb.WriteString("<Turn>\n")
				sb.WriteString(fmt.Sprintf("  <QuestionAsked>%s</QuestionAsked>\n", questions.Question[i]))
				
				// Safety check to ensure we don't crash if arrays are uneven length
				if i < len(questions.Rating) {
					sb.WriteString(fmt.Sprintf("  <RatingGiven>%s</RatingGiven>\n", questions.Rating[i]))
				}
				if i < len(questions.Review) {
					// Assuming Review stores the feedback text
					sb.WriteString(fmt.Sprintf("  <FeedbackGiven>%s</FeedbackGiven>\n", questions.Review[i])) 
				}
				sb.WriteString("</Turn>\n")
			}
			sb.WriteString("</History>\n")

			// B. Add the Active Interaction
			currentQIndex := len(questions.Question) - 1
			sb.WriteString("<CurrentInteraction>\n")
			sb.WriteString(fmt.Sprintf("  <Question>%s</Question>\n", questions.Question[currentQIndex]))
			sb.WriteString(fmt.Sprintf("  <CandidateAnswer>%s</CandidateAnswer>\n", answer))
			sb.WriteString("</CurrentInteraction>\n")
		}

		// C. Add Constraints
		sb.WriteString(constraintNextQuestion)
	}

	return sb.String()
}