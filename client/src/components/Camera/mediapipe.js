import {
      NOSE_ALLIGNMENT_THRESHOLD_ANGLE,
      CHEEK_ANGLE_THRESHOLD,
      EYE_ANGLE_THRESHOLD,
      IRIS_FRAME_THRESHOLD,
      CLOSED_EYE_RATIO_THRESHOLD,
} from './Constants.js';
import { mediapipeResponse } from './mediapipeResponse.js';


// Check if nose is vertically aligned
const isNoseVerticallyAligned = (landmarks) => {
      const [noseTop, noseBottom] = [landmarks[6], landmarks[5]];

      const deltaX = noseTop.x - noseBottom.x;
      const deltaY = noseTop.y - noseBottom.y;

      // Calculate angle between the nose line and the horizontal axis
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Normalize angle to be within [-90, 90]
      const normalizedAngle = (angle + 360) % 180 - 90;

      // Check if the normalized angle is within the tolerance range
      return Math.abs(normalizedAngle) <= NOSE_ALLIGNMENT_THRESHOLD_ANGLE;
};


// Check if both cheeks are visible
const isBothCheeksVisible = (landmarks) => {
      const [leftCheekEnd, rightCheekEnd, nose] = [
            landmarks[454],
            landmarks[234],
            landmarks[1]
      ];

      const noseToLeftCheekEnd = Math.sqrt(
            (nose.x - leftCheekEnd.x) ** 2 + (nose.y - leftCheekEnd.y) ** 2
      );
      const noseToRightCheekEnd = Math.sqrt(
            (nose.x - rightCheekEnd.x) ** 2 + (nose.y - rightCheekEnd.y) ** 2
      );

      // Calculate the ratio difference between left and right distances
      const ratioDifference = Math.abs(noseToLeftCheekEnd - noseToRightCheekEnd) / Math.max(noseToLeftCheekEnd, noseToRightCheekEnd);

      // Check if the ratio difference is within the tolerance, meaning both cheeks are equally visible
      return ratioDifference < CHEEK_ANGLE_THRESHOLD;
};


// Check if face is not looking up or down
const doesNotLookingUpOrDown = (landmarks) => {
      const [leftEyeTop, leftEyeBottom, rightEyeTop, rightEyeBottom, nose, mouthTop] = [
            landmarks[159],
            landmarks[145],
            landmarks[386],
            landmarks[374],
            landmarks[1],
            landmarks[13]
      ];

      // Calculate the average eye top and bottom positions
      const avgEyeTopY = (leftEyeTop.y + rightEyeTop.y) / 2;
      const avgEyeBottomY = (leftEyeBottom.y + rightEyeBottom.y) / 2;

      // Calculate the vertical distance from the nose to the average eye top and bottom
      const noseToEyeTopDistance = Math.abs(nose.y - avgEyeTopY);
      const noseToEyeBottomDistance = Math.abs(nose.y - avgEyeBottomY);

      // Calculate the vertical distance from the nose to the top of the mouth
      const noseToMouthTopDistance = Math.abs(nose.y - mouthTop.y);

      // Calculate the ratio between these distances
      const eyeNoseRatio = noseToEyeTopDistance / noseToEyeBottomDistance;
      const noseMouthRatio = noseToMouthTopDistance / (noseToEyeTopDistance + noseToEyeBottomDistance);

      // Define tolerance for detecting looking up or down
      const eyeTolerance = EYE_ANGLE_THRESHOLD;
      const mouthTolerance = EYE_ANGLE_THRESHOLD;

      // Check if the eye-nose ratio is close to 1 (indicating that the person is looking straight)
      const isLookingStraight = Math.abs(eyeNoseRatio - 1) < eyeTolerance;

      // Check if the nose-mouth ratio indicates looking down
      const isLookingDown = noseMouthRatio < (1 - mouthTolerance);

      return isLookingStraight && !isLookingDown;
};



// Check if eyes are detected
const eyesDetected = (landmarks) => {
      const [leftIrisCenter, rightIrisCenter] = [landmarks[473], landmarks[468]];

      // Define dynamic bounds based on the margin
      const lowerBound = IRIS_FRAME_THRESHOLD;
      const upperBound = 1 - IRIS_FRAME_THRESHOLD;

      // Check if the left eye is within the bounds
      if (
            leftIrisCenter.x < lowerBound || leftIrisCenter.x > upperBound ||
            leftIrisCenter.y < lowerBound || leftIrisCenter.y > upperBound
      ) {
            return false;
      }

      // Check if the right eye is within the bounds
      if (
            rightIrisCenter.x < lowerBound || rightIrisCenter.x > upperBound ||
            rightIrisCenter.y < lowerBound || rightIrisCenter.y > upperBound
      ) {
            return false;
      }

      return true;
};


// Check if eyes are closed
const isEyeClosed = (landmarks) => {
      // Eye landmarks
      const [
            leftTopInnerCorner,
            leftBottomInnerCorner,
            leftEyeOuterCorner,
            rightTopInnerCorner,
            rightBottomInnerCorner,
            rightEyeOuterCorner
      ] = [
                  landmarks[386],
                  landmarks[374],
                  landmarks[263],
                  landmarks[159],
                  landmarks[145],
                  landmarks[33]
            ];

      // Calculate the vertical distances for both eyes
      const leftEyeVerticalDistance = Math.abs(leftTopInnerCorner.y - leftBottomInnerCorner.y);
      const rightEyeVerticalDistance = Math.abs(rightTopInnerCorner.y - rightBottomInnerCorner.y);

      // Calculate the horizontal (width) distances for both eyes
      const leftEyeWidth = Math.abs(leftTopInnerCorner.x - leftEyeOuterCorner.x);
      const rightEyeWidth = Math.abs(rightTopInnerCorner.x - rightEyeOuterCorner.x);

      // Calculate the ratios of vertical distance to width for both eyes
      const leftEyeRatio = leftEyeVerticalDistance / leftEyeWidth;
      const rightEyeRatio = rightEyeVerticalDistance / rightEyeWidth;

      // Average the ratios
      const averageEyeRatio = (leftEyeRatio + rightEyeRatio) / 2;

      // Check if the average ratio indicates the eyes are closed
      return averageEyeRatio < CLOSED_EYE_RATIO_THRESHOLD;
};


// Main detection function
export const detectUnfairMeans = (landmarks) => {
      // console.log("Landmarks: ", landmarks);

      if (!isNoseVerticallyAligned(landmarks)) {
            console.log("Please straighten your face");
            return new mediapipeResponse(false, "Please straighten your face", "warning");
      }
      if (!isBothCheeksVisible(landmarks)) {
            console.log("Please look in front");
            return new mediapipeResponse(false, "Please look in front", "warning");
      }
      if (!doesNotLookingUpOrDown(landmarks)) {
            console.log("Please look straight");
            return new mediapipeResponse(false, "Please look straight", "warning");
      }
      if (!eyesDetected(landmarks)) {
            console.log("Please come in the center of the camera");
            return new mediapipeResponse(false, "Please come in the center of the camera", "warning");
      }
      if (isEyeClosed(landmarks)) {
            console.log("Please open your eyes");
            return new mediapipeResponse(false, "Please open your eyes", "warning");
      }
      return new mediapipeResponse(true, "All good", "success");
};



// ... (keep existing code above)

/**
 * Checks for microphone status and speech detection
 * @param {string} transcript - The accumulated text from speech recognition
 * @param {boolean} listening - Whether the microphone is currently active
 * @param {function} resetTranscript - Function to clear the transcript
 * @param {string} micStatus - The status of the microphone (e.g., 'granted', 'denied')
 */
export const micCheck = (transcript, listening, resetTranscript, micStatus) => {
      // 1. Check if the microphone permission is denied or if it's not listening
      if (micStatus === 'denied' || !listening) {
            return new mediapipeResponse(false, "Microphone is required for the exam", "danger");
      }

      // 2. Check if the user is speaking
      // If the transcript has content, it means speech/noise was detected
      if (transcript && transcript.trim().length > 0) {
            // Clear the transcript so the same speech doesn't trigger the warning repeatedly
            resetTranscript(); 
            
            console.log("Speaking detected:", transcript);
            return new mediapipeResponse(false, "Speaking/Noise detected", "warning");
      }

      // 3. If everything is fine
      return new mediapipeResponse(true, "Microphone OK", "success");
};
