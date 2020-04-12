import ReactDOM from 'react-dom';
import classnames from 'classnames';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import regeneratorRuntime from 'regenerator-runtime'
import {useMediaLayout} from 'use-media';
import 'core-js/features/promise';
import 'core-js/features/object/entries';
import 'core-js/features/array/from';
import 'unfetch/polyfill/index.js';

const ReactSwal = withReactContent(Swal)


const initialDate = new Date();
initialDate.setTime(0);
initialDate.setDate(22);
initialDate.setMonth(10);

const MAX_VIOLENCE_LEVEL = 100;

function getScreenWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}
window.onload = async function() {
    const baseXml = await (await (fetch("orange.xml"))).text();
    const xmlDoc = new DOMParser().parseFromString(baseXml,"text/xml");
    window.orangeXmlDoc = xmlDoc
    if(xmlDoc == null)
        throw new Error("Cannot parse XML document");
    function PoliticalChoiceButton(props) {
        return <button onClick={props.onClick} className={classnames("political-choice-button", props.selected && "button-selected")}><span>{props.children}</span></button>;
    }
    function PoliticalChoiceView(props) {
        const onClickChoice = (i) => props.setSelectedChoice(i);
        return <div className={classnames("politician-choice-view", props.fillScreen && 'politician-choice-view-fill-screen', !props.showView && 'politician-choice-view-force-hide', props.alignment && `politician-choice-view-${props.alignment}`, props.color && `color-${props.color}`, props.hideChoices && "politician-choice-view-hide-choices")}>
            <div className="fake-background"></div>
            <div className="political-choices">
                {props.availableChoices?.map((choice, i) => <PoliticalChoiceButton key={choice} onClick={onClickChoice.bind(void 0, i)} selected={props.selectedChoice == i}>{choice}</PoliticalChoiceButton>)}
            </div>
            <div className="politician-choice-view-extra-spacer"></div>
            <div className="politician-image-container">
            <div className={classnames("circle-outline", props.fillScreen && "circle-outline-fill-screen")}></div>
                <div className="background-wrapper">
                <div className="background-halfcircle"></div><img draggable="false" className="politician-image" src={props.politician}/></div>
            </div>
            <div className={classnames("politician-name", props.fillScreen && "politician-name-fill-screen")}>{props.name}</div>
        </div>
    }
    function Meter(props) {
        return <>
            <div className="meter-background"></div>
            <span className="meter-label">Tension Meter:</span>
            <br/>
            <div className="meter">
                <img className="meter-base" src="sprites/meter.svg"/>
                <div className="pivot-point" style={{transform: `translateX(-50%) rotate(${((props.violenceLevel/MAX_VIOLENCE_LEVEL)*180)}deg)`}}>
                    <img className="meter-needle" src="sprites/needle.svg"/>
                </div>
            </div>
        </>;
    }
    function Credits() {
        return <span className="credits">Adapted from a <a href="https://www.tigweb.org/games/orange/orangeData.xml">TakingITGlobal resource</a>.</span>;
    }
    function PoliticianSelectButton(props) {
        const id = `politicianselect${props.side}`;
        return <>
            <input type="radio" id={id} name="politicianselect" checked={props.selected} onChange={props.onButtonSelect} className={"politician-radio-hide"}/>
            <label for={id} className={classnames("politician-select-button", `politician-select-button-${props.side}`)}></label>
        </>;
    }
    function App() {
        const [ selectedYanuChoice, setSelectedYanuChoice ] = React.useState(-1);
        const [ selectedYushChoice, setSelectedYushChoice ] = React.useState(-1);
        const [ runningHideAnimation, setRunningHideAnimation ] = React.useState(false);
        const readyToContinue = selectedYushChoice != -1 && selectedYanuChoice != -1;
        const continueButtonVisible = (readyToContinue&&!runningHideAnimation);
        const [ undoHistory, setUndoHistory ] = React.useState([]);
        const [ currentControlPoint, setCurrentControlPoint ] = React.useState("1");
        const [ undoPoint, setUndoPoint ] = React.useState(null);
        const [ showTitleScreen, setShowingTitleScreen ] = React.useState(true);
        const [ currentlyShownPolitician, setCurrentlyShownPolitician ] = React.useState(false);
        
        

        const dPoint = React.useMemo(() => xmlDoc.querySelector(`dPoint[num="${currentControlPoint}"]`), [ currentControlPoint ]);

        const endingType = React.useMemo(() => dPoint.getAttribute("endingType"), [ dPoint ]);

        const dateString = React.useMemo(() => dPoint.getAttribute("date"), [ dPoint ]);

        const daysRemainingString = React.useMemo(() => dPoint.getAttribute("daysRemaining"), [ dPoint ]);

        const violenceBreaksOut = React.useMemo(() => endingType != null || violenceLevel >= MAX_VIOLENCE_LEVEL, [ endingType, dPoint, violenceLevel ]);

        const small320Screen = useMediaLayout({ maxWidth: '380px' });

        

        React.useEffect(() => {
            if(dPoint.getAttribute("isIntervention") == "true" || dPoint.getAttribute("isNewsflash") == "true") {
                let interventionEl = dPoint.getElementsByTagName("intervention")[0];
                if(typeof interventionEl == 'undefined')
                    interventionEl = dPoint.getElementsByTagName("newsflash")[0];
                if(typeof interventionEl == 'undefined') {
                    console.error("Can't find intervention text");
                    return;
                }
                Swal.fire({
                    text: interventionEl.textContent,
                    icon: 'info'
                });
            }
        }, [ dPoint ]);
        React.useEffect(() => {
            if(small320Screen) {
                if(selectedYanuChoice != -1 && selectedYushChoice == -1) {
                    setCurrentlyShownPolitician(true);
                } else if(selectedYushChoice != -1 && selectedYanuChoice == -1) {
                    setCurrentlyShownPolitician(false);
                }
            }
        }, [ selectedYanuChoice, selectedYushChoice, small320Screen ]);

        const violenceLevel = React.useMemo(() => {
            if(violenceBreaksOut)
                return 100;
            else
                return parseInt(dPoint.getElementsByTagName("pressure")[0].textContent);
        }, [ dPoint, violenceBreaksOut ]);
        const choiceName = (selectedYanuChoice+1) + "_" + (selectedYushChoice+1);
        const quickFacts = React.useMemo(() => dPoint.getElementsByTagName("extraInfo")[0]?.textContent, [ dPoint ]);

        const yanuChoices = React.useMemo(() => {
            if(violenceBreaksOut)
                return [];
            const char = dPoint.querySelector(`char[num="1"]`);
            const children = Array.from(char.childNodes).filter(child => child.nodeType == Node.ELEMENT_NODE);
            return children.map(option => option.textContent);
        }, [ dPoint, violenceBreaksOut ]);
        const yushChoices = React.useMemo(() => {
            if(violenceBreaksOut)
                return [];
            const char = dPoint.querySelector(`char[num="2"]`);
            const children = Array.from(char.childNodes).filter(child => child.nodeType == Node.ELEMENT_NODE);
            return children.map(option => option.textContent);
        }, [ dPoint, violenceBreaksOut ]);

        const currentInfo = React.useMemo(() => {
            if(!violenceBreaksOut)
                return <>
                    {dPoint.getElementsByTagName("text")[0].textContent}
                </>;
            else
                return <>
                    <h5>GAME OVER</h5>
                    {dPoint.getElementsByTagName("text")[0].textContent}
                    <p></p>
                    {endingType == "bad" ? <>You can hit the <i onClick={onUndo} className="fas fa-long-arrow-alt-left undo-button-i"></i> button to try again!</> : <>Thanks for playing!</>}
                </>;
        }, [ violenceBreaksOut, dPoint ]);
        
        const onContinue = () => {
            if(!readyToContinue)
                return;
            setRunningHideAnimation(true);
        };
        const onUndo = () => {
            if(undoHistory.length == 0)
                return;
            const newHistory = undoHistory.slice();
            const lastIndex = newHistory.pop();
            setUndoPoint(lastIndex);
            setUndoHistory(newHistory);
            setRunningHideAnimation(true);
        };
        const showCurrentInfo = () => {
            if(getScreenWidth() <= 950)
                ReactSwal.fire({
                    title: dateString,
                    html: <>
                        {currentInfo}
                        <p></p>
                        {quickFacts && <><b>Hint:</b>&nbsp;{quickFacts}</>}
                        <div className="swal-meter-container">
                            <Meter violenceLevel={violenceLevel}/>
                        </div>
                    </>
                });
        };
        const fireInitialSlideshow = async() => {
            await Swal.fire({
                title: 'Instructions',
                text: "In just a few moments, you'll find yourself taking place in the 2004 Ukranian Orange Revolution. Your job is to make decisions for the two main presidential candidates. Make your decisions wisely - the goal is to lead the country through fair elections without violence."
            });
            await Swal.fire({
                title: 'Viktor Yanukovych',
                text: "Yanukovych had a strong lead in the election campaign. He had support of incumbent government officials. His campaign revolved around strengthening Russian ties.",
                customClass: {
                    image: 'swal-politician-image'
                },
                imageUrl: 'sprites/yanukovych.png'
            });
            await Swal.fire({
                title: 'Viktor Yushchenko',
                text: "Viktor Yushchenko was Yanukovych's main opposition. He wanted to build further alliances with the western side of the world.",
                customClass: {
                    image: 'swal-politician-image'
                },
                imageUrl: 'sprites/yushchenko.png'
            });
            setShowingTitleScreen(false);
        };
        React.useEffect(() => {
            if((readyToContinue||undoPoint != null) && runningHideAnimation) {
                var i = setTimeout(() => {
                    if(true) {
                        setRunningHideAnimation(false);
                        if(readyToContinue) {
                            const newUndoPoint = {};
                            newUndoPoint.index = currentControlPoint;
                            newUndoPoint.vLevel = violenceLevel;
                            const newHistory = undoHistory.slice();
                            newHistory.push(newUndoPoint);
                            setUndoHistory(newHistory);

                            const selector = `choice[num="${choiceName}"]`;
                            console.log(selector);
                            const destination = dPoint.querySelector(selector);
                            console.log("destination", destination.textContent);
                            setCurrentControlPoint(destination.textContent.trim());
                            setCurrentlyShownPolitician(false);

                            //setViolenceLevel(Math.min(violenceLevel + gameControlPoint[currentControlPoint].yanuChoices[selectedYanuChoice].v + gameControlPoint[currentControlPoint].yushChoices[selectedYushChoice].v, MAX_VIOLENCE_LEVEL));
                            //setCurrentControlPoint(gameControlPoint[currentControlPoint].linkTo);
                            //setCurrentControlPoint()
                        } else {
                            setCurrentControlPoint(undoPoint.index);
                            setCurrentlyShownPolitician(false);
                            //setViolenceLevel(undoPoint.vLevel);
                        }
                        setSelectedYanuChoice(-1);
                        setSelectedYushChoice(-1);
                        showCurrentInfo();
                    }
                }, 2000);
                return () => clearTimeout(i);
            }
        }, [ undoPoint, runningHideAnimation, violenceLevel ]);
        React.useEffect(() => {
            if(!showTitleScreen)
                showCurrentInfo();
        }, [ showTitleScreen ]);
        if(!showTitleScreen)
            return <>
                <div className="extra-info">
                    <button onClick={onContinue} disabled={!readyToContinue} className={classnames("continue-button", continueButtonVisible && "continue-button-visible")}>CONTINUE</button>
                    <div className="info-row">
                        <div className="info left-aligned-info date-info">
                            <h6>DATE</h6>
                            <div className="date-row"><button onClick={onUndo} className={classnames("undo-button", (undoHistory.length > 0 && !runningHideAnimation) && "undo-button-visible")}><i className="fas fa-long-arrow-alt-left undo-button-i"></i></button><span>{dateString}</span></div>
                            <h6>DAYS REMAINING</h6>
                            <span>{daysRemainingString}</span>
                        </div>
                        <div className="generic-filler"></div>
                        <div className="info right-aligned-info quick-facts-info">
                            <h6>QUICK FACTS</h6>
                            <span className="quick-facts">{quickFacts}</span>
                        </div>
                    </div>
                </div>
                <div className="extra-info extra-info-grow">
                    <div className={classnames("info", "center-info", continueButtonVisible && "center-info-pushdown", runningHideAnimation && "center-info-hide", violenceBreaksOut && "center-info-violence")}>
                        <span className="see-info-container"><button onClick={showCurrentInfo} className="see-info-button">See info</button><br/></span>
                        <span className="real-info">{currentInfo}</span>
                        {!violenceBreaksOut && <>
                            <br/>
                            <span className={classnames("make-decision", small320Screen ? "make-decision-switcher" : "make-decision-regular")}>
                                {!small320Screen && <i className="fas fa-long-arrow-alt-left"></i>}
                                {small320Screen && <PoliticianSelectButton onButtonSelect={() => setCurrentlyShownPolitician(false)} side="left" selected={!currentlyShownPolitician}/>}
                                <span className="decision-text">{small320Screen ? "DECIDE" : "MAKE YOUR DECISION"}</span>
                                {!small320Screen && <i className="fas fa-long-arrow-alt-right"></i>}
                                {small320Screen && <PoliticianSelectButton onButtonSelect={() => setCurrentlyShownPolitician(true)} side="right" selected={currentlyShownPolitician}/>}
                            </span>
                        </>}
                    </div>
                </div>
                <div className="politician-row">
                    <PoliticalChoiceView fillScreen={small320Screen} showView={(!small320Screen||!currentlyShownPolitician)} hideChoices={runningHideAnimation||violenceBreaksOut} alignment="left" politician={"sprites/yanukovych.png"} name="Viktor Yanukovych" color="blue"
                        setSelectedChoice={setSelectedYanuChoice} selectedChoice={selectedYanuChoice} availableChoices={yanuChoices}>

                    </PoliticalChoiceView>
                    {!small320Screen && <div className="meter-container" style={{visiblity: endingType == null ? null : 'hidden' }}>
                        <div className="real-meter-container">
                            <Meter violenceLevel={violenceLevel}/>
                        </div>
                    </div>}
                    <PoliticalChoiceView fillScreen={small320Screen} showView={(!small320Screen||currentlyShownPolitician)} hideChoices={runningHideAnimation||violenceBreaksOut} alignment="right" politician={"sprites/yushchenko.png"} name="Viktor Yushchenko" color="orange"
                        setSelectedChoice={setSelectedYushChoice} selectedChoice={selectedYushChoice} availableChoices={yushChoices}>

                    </PoliticalChoiceView>
                </div>
                <Credits/>
            </>;
        else
            return <>
                <span className="title">{document.title}</span>
                <button className="start-button" onClick={fireInitialSlideshow}><i className="fas fa-play"/></button>
                <Credits/>
            </>;
    }
    ReactDOM.render(<App/>, document.getElementById("game-container"));
}