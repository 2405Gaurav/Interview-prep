class mediapipeResponse {
      constructor(allGood, message, label) {
            this.allGood = allGood;
            this.message = message;
            this.label = label;
      }
      // Method to compare two instances of MediapipeResponse
      isEqual(other) {
            return (
                  this.allGood === other.allGood &&
                  this.message === other.message &&
                  this.label === other.label
            );
      }
}

export { mediapipeResponse };