import {React, useState, useEffect} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,


  } from '@mui/material';
  import {getAudioUrl, getNumberVerses, getVerseText, getChapterName} from '../../backend.js';
  import { getVerseTextOfFont } from '../../utils.js';
  import DoneIcon from '@mui/icons-material/Done';
  import QuizIcon from '@mui/icons-material/Quiz';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  import CloseIcon from '@mui/icons-material/Close';
  import Verse from '../../components/Verse/Verse.jsx';
  import './TestResults.css';
  import moment from 'moment';
  import useMediaQuery from '@mui/material/useMediaQuery';


const TestResults = () => {
    const [verseTexts, setVerseTexts] = useState({});
    const [resultsList, setResultsList] = useState([]);
    const [averageScore, setAverageScore] = useState(0);
    const isMobile = useMediaQuery('(max-width:500px)');
    // const [averageScore, setAverageScore]

    useEffect(() => {
        const getAverageScore = (list = resultsList) => {
            const totalScore = list.reduce((result, currentValue) => currentValue.correctAnswers.length + result, 0);
            const totalNumQuestions = list.reduce((result, currentValue) => currentValue.correctAnswers.length + currentValue.incorrectAnswers.length + result, 0);
            return Math.round(100 * (totalScore / totalNumQuestions)).toString();
        }

        const testResults = localStorage.getItem('results');
        if (testResults) {
            const parsedResults = JSON.parse(testResults);
            setResultsList(parsedResults);
            fetchAllVerseTexts(parsedResults);

            setAverageScore(getAverageScore(parsedResults));
        }

        
    }, []);

    const fetchAllVerseTexts = async (results) => {
        const texts = {};
        for (const result of results) {
        await fetchVerseTextsForResult(result.correctAnswers, texts);
        await fetchVerseTextsForResult(result.incorrectAnswers, texts);
        }
        setVerseTexts(texts);
    };

    const fetchVerseTextsForResult = async (verses, texts) => {
        for (const verse of verses) {
            texts[`${verse.chapterNumber}:${verse.verseNumber}`] = await getVerseTextOfFont(verse.chapterNumber, verse.verseNumber);
            const nextVerse = await getVerseTextOfFont(verse.chapterNumber, verse.verseNumber + 1);
            if (nextVerse) texts[`${verse.chapterNumber}:${verse.verseNumber + 1}`] = nextVerse;
            const thirdVerse = await getVerseTextOfFont(verse.chapterNumber, verse.verseNumber + 2);
            if (thirdVerse) texts[`${verse.chapterNumber}:${verse.verseNumber + 2}`] = thirdVerse;
        }
    };

    if (localStorage.getItem('results') === null) {
        return <div className='outerTestResultsDiv'><h4>No results found.</h4></div>;
    }


    const getTestDetails = (result) => {
        return(
            <>
            <Typography variant="subtitle1" gutterBottom>
              Correct Answers:
            </Typography>
            <List dense>
                <div className='correctAnswersDiv'>
              {result.correctAnswers.length > 0 && result.correctAnswers.map((answer, index) => (
                <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                    <DoneIcon color="success" />
                    <div style={{marginRight: "8px"}}></div> {answer.chapterNumber}:{answer.verseNumber}
                </AccordionSummary>
                <AccordionDetails>
                    {/* get and show the 3 verses */}
                    {[answer, {chapterNumber: answer.chapterNumber, verseNumber: answer.verseNumber + 1},
                        {chapterNumber: answer.chapterNumber, verseNumber: answer.verseNumber + 2}].map((verse, verseIndex) => (
                      verse && verseTexts[`${verse.chapterNumber}:${verse.verseNumber}`]  ?
                      <>
                        <ListItem key={verseIndex} style={{paddingLeft: isMobile ? "0px" : "inherit", paddingRight: isMobile ? "0px" : "inherit"}}>
                        <ListItemIcon>
                           {answer.chapterNumber}:{answer.verseNumber + verseIndex}
                        </ListItemIcon>
                        <ListItemText 
                            dir="rtl" 
                            primary={(<Verse verseText={verseTexts[`${verse.chapterNumber}:${verse.verseNumber}`]} chapterNumber={verse.chapterNumber} verseNumber={verse.verseNumber} className='resultDialog'></Verse>)} 
                            style={{
                                textAlign: 'right',
                            }}
                        />
                      </ListItem>
                      {/* {verseIndex !== answer.verses.length - 1 && <Divider />} */}
                      </> : <></>
                    ))}
                </AccordionDetails>
              </Accordion>
              ))}
              </div>
    
              <div className='incorrectAnswersDiv'>
            {result.incorrectAnswers.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Incorrect Answers:
                </Typography>
                
                <List dense>
                  {result.incorrectAnswers.map((answer, index) => (
                    <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                        <CloseIcon color="error" />
                        <div style={{marginRight: "8px"}}></div> {answer.chapterNumber}:{answer.verseNumber}
                    </AccordionSummary>
                    <AccordionDetails>
                        {[answer, {chapterNumber: answer.chapterNumber, verseNumber: answer.verseNumber + 1},
                            {chapterNumber: answer.chapterNumber, verseNumber: answer.verseNumber + 2}].map((verse, verseIndex) => (
                          verse && verseTexts[`${verse.chapterNumber}:${verse.verseNumber}`] ?
                          <>
                            <ListItem key={verseIndex}>
                            <ListItemIcon>
                              {/* <DoneIcon color="success" /> */}
                              {verse.chapterNumber}:{verse.verseNumber}
                            </ListItemIcon>
                            <ListItemText 
                                dir="rtl" 
                                primary={(verse ? <Verse verseText={verseTexts[`${verse.chapterNumber}:${verse.verseNumber}`]} chapterNumber={verse.chapterNumber} verseNumber={verse.verseNumber} className='resultDialog'></Verse> : <></>)} 
                                style={{
                                    textAlign: 'right',
                                    // paddingRight: theme.spacing(2),
                                }}
                            />
                          </ListItem>
                            {/* {verseIndex !== answer.verses.length - 1 && <Divider />} */}
                          </> : <></>
                          
                        ))}
                    </AccordionDetails>
                  </Accordion>
                  ))}
                </List>
              </>
            )}
            </div>
            </List>
            </>
        )
    }


    return(
        <div className='outerTestResultsDiv'>
            <Typography variant="h6" gutterBottom underline>
                Test Results
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Average Score: {averageScore}%
            </Typography>
            {/* <Typography variant="subtitle1" gutterBottom>
                Average Score This Month:
            </Typography> */}
            {
                resultsList.map(result => {
                    return(
                        <Accordion key={result.isoDate}>
                        <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        >
                        <QuizIcon color="info" />
                        <div style={{marginRight: "8px"}}></div>
                        {result.correctAnswers.length} out of {result.correctAnswers.length + result.incorrectAnswers.length}
                        <div style={{marginRight: "20px"}}></div>
                        From verse {result.startChapterNumber}:{result.startVerseNumber} to {result.endChapterNumber}:{result.endVerseNumber}
                        </AccordionSummary>

                        <AccordionDetails>
                            <>
                            <Typography variant="body1" gutterBottom>
                                Date of test: {moment(result.isoDate).format('LLL')}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Time taken: {moment(result.timeTaken).format('mm:ss')}
                            </Typography>
                            {getTestDetails(result)}
                            </>
                        </AccordionDetails>
                        </Accordion>
                    )
                })
            }
            {/* <FormControl>
                <Typography variant="h6" gutterBottom>
                You scored {resultsList.correctAnswers.length} out of {resultstotalQuestions}
                </Typography>
                <Typography variant="body1" gutterBottom>
                Time taken: {timeTaken}
                </Typography>
            </FormControl> */}
        </div>
    );
}


export default TestResults;