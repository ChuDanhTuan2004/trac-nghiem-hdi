class QuizGenerator {
    constructor() {
      this.questions = []
      this.currentQuestionIndex = 0
      this.userAnswers = []
  
      this.initializeElements()
      this.bindEvents()
    }
  
    initializeElements() {
      // Screens
      this.inputScreen = document.getElementById("inputScreen")
      this.previewScreen = document.getElementById("previewScreen")
      this.quizScreen = document.getElementById("quizScreen")
      this.resultsScreen = document.getElementById("resultsScreen")
  
      // Input elements
      this.inputText = document.getElementById("inputText")
      this.generateBtn = document.getElementById("generateBtn")
  
      // Preview elements
      this.questionCount = document.getElementById("questionCount")
      this.previewQuestions = document.getElementById("previewQuestions")
      this.startQuizBtn = document.getElementById("startQuizBtn")
  
      // Quiz elements
      this.questionNumber = document.getElementById("questionNumber")
      this.progressBadge = document.getElementById("progressBadge")
      this.progressFill = document.getElementById("progressFill")
      this.currentQuestion = document.getElementById("currentQuestion")
      this.answerOptions = document.getElementById("answerOptions")
      this.prevBtn = document.getElementById("prevBtn")
      this.nextBtn = document.getElementById("nextBtn")
  
      // Results elements
      this.scorePercentage = document.getElementById("scorePercentage")
      this.scoreText = document.getElementById("scoreText")
      this.detailedResults = document.getElementById("detailedResults")
      this.retakeBtn = document.getElementById("retakeBtn")
  
      // Reset buttons
      this.resetBtn1 = document.getElementById("resetBtn1")
      this.resetBtn2 = document.getElementById("resetBtn2")
    }
  
    bindEvents() {
      this.inputText.addEventListener("input", () => {
        this.generateBtn.disabled = !this.inputText.value.trim()
      })
  
      this.generateBtn.addEventListener("click", () => this.generateQuiz())
      this.startQuizBtn.addEventListener("click", () => this.startQuiz())
      this.prevBtn.addEventListener("click", () => this.previousQuestion())
      this.nextBtn.addEventListener("click", () => this.nextQuestion())
      this.retakeBtn.addEventListener("click", () => this.startQuiz())
      this.resetBtn1.addEventListener("click", () => this.resetApp())
      this.resetBtn2.addEventListener("click", () => this.resetApp())
    }
  
    parseQuizContent(text) {
      const parsedQuestions = []
      const questionBlocks = text.split('<div class="block-quiz-test"')
  
      questionBlocks.forEach((block, index) => {
        if (index === 0) return
  
        try {
          // Extract question text
          const questionMatch = block.match(/<span class="quiz-title"><strong>(.*?)<\/strong><\/span>/)
          if (!questionMatch) return
  
          const questionText = questionMatch[1]
            .replace(/Câu \d+\$\$\d+ Điểm\$\$ : /, "")
            .replace(/<[^>]*>/g, "")
            .trim()
  
          // Extract options
          const options = []
          const optionRegex = /<div class="w-100 border-left p-1 text-answer">\s*(.*?)\s*<\/div>/g
          let optionMatch
  
          while ((optionMatch = optionRegex.exec(block)) !== null) {
            const optionText = optionMatch[1]
              .replace(/<[^>]*>/g, "")
              .replace(/&[^;]+;/g, " ")
              .trim()
            if (optionText) {
              options.push(optionText)
            }
          }
  
          // Find correct answer
          let correctAnswer = 0
          const correctAnswerMatch = block.match(
            /class="text-success area-answer-quiz.*?<span class="m-auto"[^>]*>([A-E])<\/span>/,
          )
          if (correctAnswerMatch) {
            const correctLetter = correctAnswerMatch[1]
            correctAnswer = correctLetter.charCodeAt(0) - "A".charCodeAt(0)
          }
  
          if (questionText && options.length > 0) {
            parsedQuestions.push({
              id: parsedQuestions.length + 1,
              question: questionText,
              options,
              correctAnswer,
            })
          }
        } catch (error) {
          console.error("Error parsing question block:", error)
        }
      })
  
      return parsedQuestions
    }
  
    generateQuiz() {
      const text = this.inputText.value.trim()
      if (!text) return
  
      this.questions = this.parseQuizContent(text)
      this.userAnswers = new Array(this.questions.length).fill(undefined)
  
      this.showPreview()
    }
  
    showPreview() {
      this.questionCount.textContent = `Đã tạo thành công ${this.questions.length} câu hỏi trắc nghiệm`
  
      // Show preview of first 5 questions
      this.previewQuestions.innerHTML = ""
      const questionsToShow = this.questions.slice(0, 5)
  
      questionsToShow.forEach((question, index) => {
        const questionDiv = document.createElement("div")
        questionDiv.className = "preview-question"
  
        const optionsHtml = question.options
          .map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctAnswer
            return `
                      <div class="preview-option ${isCorrect ? "correct text-success" : ""}">
                          ${String.fromCharCode(65 + optionIndex)}. ${option}
                      </div>
                  `
          })
          .join("")
  
        questionDiv.innerHTML = `
                  <h3>Câu ${index + 1}: ${question.question}</h3>
                  <div class="preview-options">${optionsHtml}</div>
              `
  
        this.previewQuestions.appendChild(questionDiv)
      })
  
      if (this.questions.length > 5) {
        const moreDiv = document.createElement("p")
        moreDiv.style.textAlign = "center"
        moreDiv.style.color = "#6b7280"
        moreDiv.textContent = `... và ${this.questions.length - 5} câu hỏi khác`
        this.previewQuestions.appendChild(moreDiv)
      }
  
      this.showScreen("previewScreen")
    }
  
    startQuiz() {
      this.currentQuestionIndex = 0
      this.userAnswers = new Array(this.questions.length).fill(undefined)
      this.showScreen("quizScreen")
      this.updateQuizDisplay()
    }
  
    updateQuizDisplay() {
      const question = this.questions[this.currentQuestionIndex]
      const progress = Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100)
  
      this.questionNumber.textContent = `Câu ${this.currentQuestionIndex + 1} / ${this.questions.length}`
      this.progressBadge.textContent = `${progress}%`
      this.progressFill.style.width = `${progress}%`
      this.currentQuestion.textContent = question.question
  
      // Update navigation buttons
      this.prevBtn.disabled = this.currentQuestionIndex === 0
      this.nextBtn.disabled = this.userAnswers[this.currentQuestionIndex] === undefined
      this.nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? "Hoàn Thành" : "Câu Tiếp"
  
      // Render answer options
      this.answerOptions.innerHTML = ""
      question.options.forEach((option, index) => {
        const optionDiv = document.createElement("button")
        optionDiv.className = "answer-option"
        if (this.userAnswers[this.currentQuestionIndex] === index) {
          optionDiv.classList.add("selected")
        }
  
        optionDiv.innerHTML = `
                  <div class="answer-letter">${String.fromCharCode(65 + index)}</div>
                  <div class="answer-text">${option}</div>
              `
  
        optionDiv.addEventListener("click", () => this.selectAnswer(index))
        this.answerOptions.appendChild(optionDiv)
      })
    }
  
    selectAnswer(answerIndex) {
      this.userAnswers[this.currentQuestionIndex] = answerIndex
      this.updateQuizDisplay()
    }
  
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
        this.updateQuizDisplay()
      }
    }
  
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++
        this.updateQuizDisplay()
      } else {
        this.showResults()
      }
    }
  
    calculateScore() {
      return this.questions.reduce((score, question, index) => {
        return score + (this.userAnswers[index] === question.correctAnswer ? 1 : 0)
      }, 0)
    }
  
    showResults() {
      const score = this.calculateScore()
      const percentage = Math.round((score / this.questions.length) * 100)
  
      this.scorePercentage.textContent = `${percentage}%`
      this.scorePercentage.className = "score-percentage"
  
      if (percentage >= 70) {
        this.scorePercentage.classList.add("excellent")
      } else if (percentage >= 50) {
        this.scorePercentage.classList.add("good")
      } else {
        this.scorePercentage.classList.add("poor")
      }
  
      this.scoreText.textContent = `Bạn đã trả lời đúng ${score}/${this.questions.length} câu hỏi`
  
      // Show detailed results
      this.detailedResults.innerHTML = ""
      this.questions.forEach((question, index) => {
        const isCorrect = this.userAnswers[index] === question.correctAnswer
        const userAnswerLetter =
          this.userAnswers[index] !== undefined ? String.fromCharCode(65 + this.userAnswers[index]) : "Không trả lời"
        const correctAnswerLetter = String.fromCharCode(65 + question.correctAnswer)
  
        const resultDiv = document.createElement("div")
        resultDiv.className = "result-item"
  
        const optionsHtml = question.options
          .map((option, optionIndex) => {
            let className = "result-option"
            let badge = ""
  
            if (optionIndex === question.correctAnswer) {
              className += " correct text-success"
              badge = '<span class="result-badge correct">Đáp án đúng</span>'
            } else if (optionIndex === this.userAnswers[index] && this.userAnswers[index] !== question.correctAnswer) {
              className += " user-wrong"
              badge = '<span class="result-badge wrong">Bạn chọn</span>'
            }
  
            return `
                      <div class="${className}">
                          ${String.fromCharCode(65 + optionIndex)}. ${option}${badge}
                      </div>
                  `
          })
          .join("")
  
        resultDiv.innerHTML = `
                  <div class="result-header">
                      <div class="result-icon ${isCorrect ? "correct" : "incorrect"}">
                          ${isCorrect ? "✓" : "✗"}
                      </div>
                      <div class="result-question">
                          Câu ${index + 1}: ${question.question}
                      </div>
                  </div>
                  <div class="result-options">${optionsHtml}</div>
              `
  
        this.detailedResults.appendChild(resultDiv)
      })
  
      this.showScreen("resultsScreen")
    }
  
    resetApp() {
      this.questions = []
      this.userAnswers = []
      this.currentQuestionIndex = 0
      this.inputText.value = ""
      this.generateBtn.disabled = true
      this.showScreen("inputScreen")
    }
  
    showScreen(screenId) {
      document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("active")
      })
      document.getElementById(screenId).classList.add("active")
    }
  }
  
  // Initialize the app when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    new QuizGenerator()
  })
  