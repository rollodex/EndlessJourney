var State = {
  story: { value: [], watchers: [] },  //web3.eth.addresses[0]
  achievements: { value: [], watchers:[] },

};

var intro_prompt = "Date:7/1\nBranch:In this world, you can be who you want to be. All you must do is awaken and enter your truest desires. Let the games begin! \nEmotion: optimistic | Adjectives: exicted, fascinated | Energy: 100% | Water: 100% | Integrity: 100% | Affiliation: 100% | Certainity: 100% | Competence: 100%\nAchievement: Trepid Adventurer\nBranch A: Start the adventure! | Branch B: Stay in bed.\n> You choose Branch A.\n------------\n\n"

function doNav() {
  if (location.hash == "") {
    Transition("hq");
  } else {
    console.log('hash: ' + location.hash)
    let route = location.hash.slice(1);
    let subroute = route.split('/');
    route = subroute[0];
    path = subroute[1];
    UpdateState('path',path)
    Transition(route)
  }
}

function On(key, watcher) {
  State[key].watchers.push(watcher);
}

function Transition(route) {
  if (location.hash == "")
    route = 'hq'
  console.log("Route: " + route)
  TransitionTable[route].updater();
  TransitionTable[route].loader();
}

function UpdateState(key, value) {
  if (State[key].value === value) return;
  if (!(State[key].value instanceof Array)) {
    console.log("Not array");
    State[key].value = value;
    for (w in State[key].watchers) {
      State[key].watchers[w](value);
    }
  } else {
      console.log("Array");
      State[key].value.push(value);
      for (w in State[key].watchers) {
        State[key].watchers[w](value);
      }
  }
}

var TransitionTable = {
  hq: {
    loader: function () {
      $("#current").html(document.getElementById("hq").innerHTML);

    },
    updater: function() {}
  },

  about: {
    loader: function () {

    },
    updater: function() {}
  }

}

$(window).on("hashchange", function() {
  let route = location.hash.slice(1);
  let subroute = route.split('/')
  route = subroute[0];
  path = subroute[1];
  UpdateState('path',path)
  console.log('path:' + path);
  if (route == "") Transition("hq");

  if (route == "modal1" || route == "modal2" || route == "!") return;

  //Transition(route);
});

function toggleModal () {

      const body = document.querySelector('body')
      const modal = document.querySelector('.modal')
      modal.classList.toggle('opacity-0')
      modal.classList.toggle('pointer-events-none')
      body.classList.toggle('modal-active')
}

 function doModal() {
   var openmodal = document.querySelectorAll('.modal-open')
    for (var i = 0; i < openmodal.length; i++) {
      openmodal[i].addEventListener('click', function(event){
    	event.preventDefault()
    	toggleModal()
      })
    }

    const overlay = document.querySelector('.modal-overlay')
    overlay.addEventListener('click', toggleModal)

    var closemodal = document.querySelectorAll('.modal-close')
    for (var i = 0; i < closemodal.length; i++) {
      closemodal[i].addEventListener('click', toggleModal)
    }

    document.onkeydown = function(evt) {
      evt = evt || window.event
      var isEscape = false
      if ("key" in evt) {
    	isEscape = (evt.key === "Escape" || evt.key === "Esc")
      } else {
    	isEscape = (evt.keyCode === 27)
      }
      if (isEscape && document.body.classList.contains('modal-active')) {
    	toggleModal()
      }
    };
 }

window.addEventListener("load", async () => {

  doModal();


  On("story", function (v) {

    html = v.replace(/(?:\r\n|\r|\n)/g, '<br>');
    $('#journal').append('<div class="w-11/12 mt-4 mr-8 px-8 bg-green-800 p-3 rounded-lg text-white ">' + html + '</p></div>')
  })

    parseStory(intro_prompt.split('------------'))

  On("achievements", function(v) {
    html = v.replace(/(?:\r\n|\r|\n)/g, '<br>');
    $('#ach').append('<div class="w-11/12 mt-4 mr-8 px-8 bg-blue-600 p-3 rounded-lg text-white ">' + html + '</p></div>')
  })


});



function showStoryModal() {
  //$("#modal-content").html(document.getElementById('createModal').innerHTML);
  toggleModal();
}

function doNewStory() {

  var params = {};

  params['story'] = $('#story').val()
  params['initial_energy'] = $('#initial_energy').val()
  params['initial_water'] = $('#initial_water').val()
  params['initial_integrity'] = $('#initial_integrity').val()
  params['initial_affiliation'] = $('#initial_affiliation').val()
  params['initial_certainty'] = $('#initial_certainty').val()
  params['initial_competence'] = $('#initial_competence').val()
  params['branch_a'] = $('#branch_a').val()
  params['branch_b'] = $('#branch_b').val()
  params['initial_emotion'] = $('#initial_emotion').val()
  params['adj_one'] = $('#adj_one').val()
  params['adj_two'] = $('#adj_two').val()
  params['initial_ach'] = $('#initial_ach').val()

  console.log(params)
  toggleModal();

  //Add initial prompt:
  stats_bar = "Emotion: " + params['initial_emotion'] + " | Adjectives: " + params['adj_one'] + ", " + params['adj_two'] + " | Energy: " + params['initial_energy'] + " | Water: " + params['initial_water'] + " | Integrity: " + params['initial_integrity'] + " | Affiliation: " + params['initial_affiliation'] +" | Certainty: " + params[initial_certainty] + " | Competence: " + params['initial_competence'] + "\n"
  branches = "Branch A: " + params["branch_a"] + " | " + "Branch B: " + params["branch_b"] + "\n"
  prompt = "Date:7/2\n Branch: " + params['story'] + stats_bar + "Achievement: " + params['initial_ach'] + "\n" + branches
  the_array = []
  the_array.push(prompt)
  parseStory(the_array);

  fetch('http://localhost:8080', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(params),
})
.then(response=>response.text())
.then(data=>{ parseStory(data.split('------------')); })
.catch((error) => {
  console.error('Error:', error);
});



}

function doBranchA() {

  test = State.story.value.slice(-3);
  new_prompt = test.join('\n------------\n').slice(0,-14)

  console.log("raw: " + new_prompt)

  console.log("Substring: " + new_prompt);
  new_prompt = new_prompt + '\n> You chose branch A'
  new_prompt += '\n------------\n'

  console.log("New Prompt: " + new_prompt )

  var params = {text: new_prompt};
  fetch('http://localhost:7777', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'text/json',
  },
  body: JSON.stringify(params),
})
.then(response=>response.text())
.then(data=>{ parseStory(data.split('------------')); })
.catch((error) => {
  console.error('Error:', error);
});
}

function doBranchB() {
  //alert("Branch A")
  test = State.story.value.slice(-3);
  new_prompt = test.join('\n------------\n').slice(0,-14)

  console.log("raw: " + new_prompt)

  new_prompt = new_prompt + '\n> You chose branch B'
  new_prompt += '\n------------\n'

  console.log("New Prompt: " + new_prompt )

  var params = {text: new_prompt};
  fetch('http://localhost:7777', {
  method: 'POST', // or 'PUT'
  headers: {
    'Content-Type': 'text/json',
  },
  body: JSON.stringify(params),
})
.then(response=>response.text())
.then(data=>{ parseStory(data.split('------------')); })
.catch((error) => {
  console.error('Error:', error);
});

}

function parseStory(text) {
   console.log("The text:" + text)

   //Remove the prompt:
   index = text[0].lastIndexOf('>') == -1 ?  text[0].length : text[0].lastIndexOf('>')-1
   journal_text = text[0].substring(0, index);

   //Find Acheivement
   lines = journal_text.split('\n')
   const found = lines.find(element => element.indexOf("Achievement: ") > -1);
   the_achievement = found.slice(13);
   console.log("the_achievement: " + the_achievement)

   UpdateState("achievements",the_achievement);
   UpdateState("story",journal_text);
}

function debugStory()
{
  console.log(State.story.value.join('\n------------\n'));
}
