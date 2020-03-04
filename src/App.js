import React, { useState, useEffect } from "react"
import { Route, Switch } from "react-router-dom"
import Questions from "./components/Questions/Questions"
import HomePage from "./components/HomePage/HomePage"
import QuizSummary from "./components/QuizSummary/QuizSummary"
import ErrorPage from "./components/UI/ErrorPage/ErrorPage"
import { faAmericanSignLanguageInterpreting, faCrosshairs } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import styled, { createGlobalStyle, keyframes } from "styled-components"
import axios from "axios"

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
  html {
    box-sizing: border-box;
    font-size: 62.5%;
  }
  body {
    font-family: "Rubik", sans-serif;
  }
`

const Container = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  border: 1px solid black;
  min-height: 100vh;
  background-image: linear-gradient(to right bottom, white, rgba(220, 221, 225, 1));
`
const rotate = keyframes`
  from{transform: rotate(0)}
  to{ transform: rotate(360deg)}
`
const Header = styled.header`
  display: flex;
  justify-content: center;
  height: 12rem;
  padding-top: 2.6rem;
  margin-bottom: 2rem;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 300%;
    background-color: rgba(25, 42, 86, 1);
    border-radius: 34%;
    transform: translateY(-70%);
    box-shadow: 0 1rem 2rem rgba(53, 59, 72, 1);
  }

  & > svg {
    color: #dfe6e9;
    font-size: 4rem;
    margin-right: 2rem;
  }

  & > svg:last-child {
    font-size: 2rem;
    font-weight: 300;
    animation: ${rotate} 6s infinite linear;
  }

  & > h1 {
    font-size: 4rem;
    color: rgba(76, 209, 55, 1);
    letter-spacing: 2px;
    font-weight: 300;
    margin-right: 0.4rem;
  }

  & > * {
    z-index: 1;
  }
`

const App = () => {
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [remainedTime, setRemainedTime] = useState(67)
  const [inputValue, setInputValue] = useState("")
  const [name, setName] = useState(null)
  const [storedName, setStoredName] = useState(null)
  const [wrongAnswersDeleted, setWrongAnswersDeleted] = useState(false)
  const [hintCount, setHintCount] = useState(3)
  const [correctAnswerSelected, setCorrectAnswerSelected] = useState(false)
  const [quizStartCountDown, setQuizStartCountDown] = useState(5)
  const [category, setCategory] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [sound, setSound] = useState(false)

  useEffect(() => {
    let apiKey = "https://opentdb.com/api.php?amount=10&type=multiple"
    if (difficulty) apiKey = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}&type=multiple`
    if (category) apiKey = `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`
    if (category && difficulty) apiKey = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`
    axios
      .get(apiKey)
      .then(response => {
        const handleQuestions = response.data.results.map((ques, index) => {
          const correctAnswer = ques.correct_answer
          const answers = ques.incorrect_answers
          const answerIndex = Math.floor(Math.random() * 4)
          answers.splice(answerIndex, 0, correctAnswer)
          const modifyedAnswers = answers.map((ans, index) => {
            if (ans === ques.correct_answer) {
              return { id: index, answer: ans, isSelected: false, isCorrect: true }
            } else {
              return { id: index, answer: ans, isSelected: false, isCorrect: false }
            }
          })
          return {
            id: index,
            question: ques.question,
            answers: modifyedAnswers,
            difficulty: ques.difficulty,
            category: ques.category
          }
        })
        setQuestions(handleQuestions)
      })
      .catch(err => {
        setError(true)
      })
    console.log("UseEffect")
  }, [category, difficulty])

  useEffect(() => {
    if (window.localStorage.getItem("name")) {
      setStoredName(window.localStorage.getItem("name"))
    }
  }, [storedName])

  const selectAnswerHandler = (questionId, answerId) => {
    playSound(400)
    const cloneQuestions = [...questions]
    const cloneQuestion = cloneQuestions[questionId]
    const cloneAnswers = [...cloneQuestion.answers]

    const updatedAnswers = cloneAnswers.map(ans => {
      if (answerId === ans.id) {
        return { ...ans, isSelected: true }
      } else {
        return { ...ans, isSelected: false }
      }
    })

    cloneQuestion.answers = updatedAnswers
    cloneQuestions[questionId] = cloneQuestion
    setQuestions(cloneQuestions)
  }

  const deleteTwoWrongAnswersHandler = questionId => {
    const cloneQuestions = [...questions]
    const cloneQuestion = cloneQuestions[questionId]
    const cloneAnswers = [...cloneQuestion.answers]
    const wrongAnswers = cloneAnswers.filter(ans => ans.isCorrect !== true)
    if (wrongAnswers.length === 3) {
      const firstRemovedWrongAnswer = wrongAnswers.splice(Math.floor(Math.random() * 2), 1)
      const secondRemovedWrongAnswer = wrongAnswers.splice(Math.floor(Math.random() * 1), 1)
      const updatedAnswers = cloneAnswers.filter(ans => ans.id !== firstRemovedWrongAnswer[0].id && ans.id !== secondRemovedWrongAnswer[0].id)
      cloneQuestion.answers = updatedAnswers
      cloneQuestions[questionId] = cloneQuestion
      setQuestions(cloneQuestions)
    } else {
      const updatedAnswers = cloneAnswers
        .filter(ans => ans.isCorrect === true)
        .map(ans => {
          return { ...ans, isSelected: true }
        })

      cloneQuestion.answers = updatedAnswers
      cloneQuestions[questionId] = cloneQuestion
      setQuestions(cloneQuestions)
    }
    setWrongAnswersDeleted(true)
    playSound(400)
  }

  const playSound = duration => {
    setSound(true)
    setTimeout(() => {
      setSound(false)
    }, duration)
  }

  const hintHandler = questionId => {
    const cloneQuestions = [...questions]
    const cloneQuestion = cloneQuestions[questionId]
    const cloneAnswers = [...cloneQuestion.answers]
    const wrongAnswers = cloneAnswers.filter(ans => ans.isCorrect !== true)
    const removedWrongAnswer = wrongAnswers.splice(Math.floor(Math.random() * cloneAnswers.length - 1), 1)
    let updatedAnswers = cloneAnswers.filter(ans => ans.id !== removedWrongAnswer[0].id)
    if (updatedAnswers.length === 1) {
      updatedAnswers = updatedAnswers.map(ans => {
        return { ...ans, isSelected: true }
      })
    }
    cloneQuestion.answers = updatedAnswers
    cloneQuestions[questionId] = cloneQuestion
    setQuestions(cloneQuestions)
    setHintCount(prevState => prevState - 1)
    playSound(400)
  }

  const correctAnswerHandler = questionId => {
    const cloneQuestions = [...questions]
    const cloneQuestion = cloneQuestions[questionId]
    const cloneAnswers = [...cloneQuestion.answers]
    if (cloneAnswers.length > 1) {
      const updatedAnswers = cloneAnswers.map(ans => {
        if (ans.isCorrect === true) {
          return { ...ans, isSelected: true }
        } else {
          return { ...ans, isSelected: false }
        }
      })
      cloneQuestion.answers = updatedAnswers
      cloneQuestions[questionId] = cloneQuestion
      setQuestions(cloneQuestions)
      setCorrectAnswerSelected(true)
    } else {
      alert("There is just one option")
    }
    playSound(400)
  }

  const nextQuestion = () => {
    if (currentQuestion < 9) setCurrentQuestion(prevState => prevState + 1)
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(prevState => prevState - 1)
  }

  const finishQuiz = history => {
    setIsFinished(true)
    playSound(4000)
    history.push("/quiz-summary")
    return questions.map(ques => ques.answers.map(ans => (ans.isCorrect === true && ans.isSelected === true ? setScore(prevState => (prevState += 10)) : null)))
  }

  const inputChangeHandler = event => setInputValue(event.target.value)

  const inputSubmitHandler = (event, history) => {
    event.preventDefault()
    if (inputValue.trim() !== "" || storedName) {
      setName(inputValue)
      const quizTimeinterval = setInterval(() => {
        setRemainedTime(prevState => prevState - 1)
      }, 1000)

      setTimeout(() => {
        clearInterval(quizTimeinterval)
        setIsFinished(true)
        finishQuiz(history)
      }, 67000)
      const quizStartInterval = setInterval(() => {
        setQuizStartCountDown(prevState => prevState - 1)
        playSound(400)
      }, 1000)

      setTimeout(() => {
        history.push("/questions")
        clearInterval(quizStartInterval)
      }, 7000)
      if (!storedName) {
        window.localStorage.setItem("name", inputValue)
        setStoredName(window.localStorage.getItem("name"))
      }
    } else {
      alert("please enter valid name")
    }
  }

  const categorySelectHandler = category => {
    setCategory(category)
  }

  const difficultySelectHandler = difficulty => {
    setDifficulty(difficulty)
  }

  const renameHandler = () => {
    window.localStorage.removeItem("name")
    setStoredName(null)
  }

  let categoryName = null
  if (category === 9) categoryName = "General Knowledge"
  else if (category === 21) categoryName = "Sports"
  else if (category === 10) categoryName = "Books"
  else if (category === 11) categoryName = "Film"
  else if (category === 18) categoryName = "Computer Science"
  else if (category === 23) categoryName = "History"
  else categoryName = "Any Category"
  let content = (
    <Switch>
      <Route
        path='/'
        exact
        render={({ history }) => (
          <HomePage
            inputSubmitHandler={inputSubmitHandler}
            inputChangeHandler={inputChangeHandler}
            history={history}
            name={name}
            quizStartCountDown={quizStartCountDown}
            categorySelectHandler={categorySelectHandler}
            difficultySelectHandler={difficultySelectHandler}
            category={category}
            difficulty={difficulty}
            storedName={storedName}
            renameHandler={renameHandler}
            categoryName={categoryName}
            sound={sound}
            isFinished={isFinished}
          />
        )}
      />
      <Route
        path='/questions'
        render={({ history }) => (
          <Questions
            ques={questions[currentQuestion]}
            nextQuestion={nextQuestion}
            prevQuestion={prevQuestion}
            finishQuiz={finishQuiz}
            isFinished={isFinished}
            selectAnswerHandler={selectAnswerHandler}
            remainedTime={remainedTime}
            name={name}
            history={history}
            deleteTwoWrongAnswersHandler={deleteTwoWrongAnswersHandler}
            wrongAnswersDeleted={wrongAnswersDeleted}
            hintHandler={hintHandler}
            hintCount={hintCount}
            correctAnswerHandler={correctAnswerHandler}
            correctAnswerSelected={correctAnswerSelected}
            categoryName={categoryName}
            difficulty={difficulty}
            sound={sound}
            currentQuestion={currentQuestion}
          />
        )}
      />

      <Route to='/quiz-summary' render={({ history }) => <QuizSummary history={history} isFinished={isFinite} score={score} questions={questions} />} />
    </Switch>
  )
  if (error) content = <ErrorPage />

  return (
    <Container>
      <GlobalStyle />
      <Header>
        <FontAwesomeIcon icon={faAmericanSignLanguageInterpreting} />
        <h1>Trivia Db Quiz</h1>
        <FontAwesomeIcon icon={faCrosshairs} />
      </Header>

      {/* <StyledQuestions remainedTime={remainedTime * 1.666666666}>
        <div className='questionsHeader'>
          <div className='remainedTime'>{remainedTime}</div>

          <div className='questionInformations'>
            <div className='questionCategory'>Category: Film</div>
            <div className='questionsDifficulty'>Difficulty: Hard</div>
          </div>
          <div className='questionJokers'>
            <button className='fiftyfifty'>
              <FontAwesomeIcon icon={faPooStorm} /> 50%
            </button>
            <button className='hint'>
              <FontAwesomeIcon icon={faLightbulb} /> Hint <span className='hintCount'>3</span>
            </button>
            <button className='selectCorrectAnswer'>
              <FontAwesomeIcon icon={faClipboardCheck} /> Correct
            </button>
          </div>
        </div>
        <div className='questionContent'>
          <div className='question'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente, ipsam neque quo similique fugiat enim harum esse dolor modi libero quis, totam aspernatur quos inventore blanditiis
            voluptatibus vero ullam asperiores?
          </div>
          <div className='answers'>
            <ul>
              <li className='answer'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut.</li>
              <li className='answer'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut.</li>
              <li className='answer'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut.</li>
              <li className='answer'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut.</li>
            </ul>
          </div>
        </div>
        <div className='questionButtons'>
          <button>Previous</button>
          <button>Next</button>
          <button>Finish</button>
        </div>
      </StyledQuestions> */}
      {content}
    </Container>
  )
}

export default App
