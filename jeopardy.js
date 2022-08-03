// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const $restartBtn = $('button');
let categories = [];
const NUM_CATEGORIES=6;
const NUM_CLUES=5;
const BASE = "//jservice.io/api/"
const loaderHTML = `<div class="spinner-border" role="status">
</div>`
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {

    const {data} = await axios.get(`${BASE}categories`,{params:{count:50}})
    let categoriesID = data.map(c=>c.id)
    let randomCat= _.sampleSize(categoriesID, NUM_CATEGORIES);
    return randomCat
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const {data}= await axios.get(`${BASE}category`,{params:{id:catId}})
  let {title,clues} =data
  let randomClues = _.sampleSize(clues, NUM_CLUES);
  clues = randomClues.map(c=>({
    question:c.question,
    answer:c.answer,
    showing:null
  }))
  return {title,clues}
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
//  <table id="jeopardy">
//  <thead></thead>
//  <tbody></tbody>
// </table>
async function fillTable() {
  makeHeader()
  makeBody()
}

function makeHeader(){
  const tableHead= $('thead').empty();
  const $newtr =$('<tr>')
  for ({title} of categories){
    const $newtd = $('<td>').text(title)
    $newtr.append($newtd)
  }
  tableHead.append($newtr)
}
function makeBody(){
  const tableBody= $('tbody').empty();
  for (let i = 0; i<NUM_CLUES;i++){
    const $newtr =$('<tr>')
    for (let j =0; j<NUM_CATEGORIES;j++){
      $newtr.append($('<td>',{id:`${j}-${i}`}).text('?'))
    }
    tableBody.append($newtr)
  }
}
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const targetID = evt.target.id
  const [catInd,clueInd] =targetID.split("-");
  let clue = categories[catInd].clues[clueInd]
  if (!clue){
    clue ={question:'FREE POINT'}
  }
  let {question,answer}  = clue
  if (clue.showing){
    $(`#${targetID}`).text(answer)
  }
  else{
    $(`#${targetID}`).text(question)
    clue.showing= true;
  }
  console.log (categories[catInd].clues[clueInd])
}



/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

function showLoader(){
  $restartBtn.html(loaderHTML)

}
function hideLoader(){
  $restartBtn.html('Restart Game')
}
async function setupAndStart() {
  showLoader()
  categories=[]
  let categoriesID = await getCategoryIds()
  for (ID of categoriesID){
    categories.push(await getCategory(ID))
  }
  await fillTable();
  hideLoader()
}

/** On click of start / restart button, set up game. */


$restartBtn.on('click', setupAndStart)

$('tbody').on('click',handleClick)
/** On page load, add event handler for clicking clues */

// TODO