import { v4 as uuidv4 } from 'uuid';

if (!localStorage.getItem('uuid')) {
    localStorage.setItem('uuid', uuidv4());
}

function createMessage(text, sender, type = "normal") {
    const message = document.createElement('div');
    message.classList.add('message');

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.classList.add(sender);
    if (type === "option") {
        bubble.classList.add('option')
    }

    const p = document.createElement('p');
    p.innerHTML = text;

    bubble.append(p);
    message.append(bubble);

    document.querySelector('#chat-message-list').append(message);
}

function createSpace(type) {
    const space = document.createElement('div');
    if (type === "same") {
        space.classList.add('spacing-same');
    } else {
        space.classList.add('spacing-different');
    }

    document.querySelector('#chat-message-list').append(space);
}

function createOptions(options) {
    const messages = document.querySelector('#chat-message-list');
    options.forEach((question, index, options) => {
        createMessage(question, "user", "option");
        if (index !== options.length - 1) {
            createSpace("same");
        }
    })
}

function createSolution(solution) {
    const message = document.createElement('div');
    message.classList.add('message');

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.classList.add('agent');

    bubble.innerHTML = solution

    message.append(bubble);

    document.querySelector('#chat-message-list').append(message);
}

function giveSolutions(solutions, index = 0) {

    createSolution(solutions[index][1]);
    console.log(solutions[index][0])
    createSpace("same");
    createMessage("Did this work for you?", "agent");
    createSpace("different");
    createOptions(["Yes", "No"]);
    createSpace("different")
    
    document.querySelectorAll('.option').forEach((option) => {
        option.onclick = () => {
            let selection = option.innerText.trim();
            option.classList.remove('option');
            option.onclick = '';
            document.querySelectorAll('.option').forEach((unselected) => {
                unselected.remove();
            })

            if (selection === "Yes") {
                createMessage("Great to hear! Have a great day.", "agent");
            } else if (index < solutions.length - 1) {
                giveSolutions(solutions, index += 1);
            } else {
                createMessage("Sorry, we're out of solutions.", "agent");
            }

        }
    })
}

function createLoading() {
    const loader = document.createElement('div');
    loader.classList.add('message')

    const bubble = document.createElement('div')
    bubble.classList.add('bubble')
    bubble.classList.add('loading')

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div')
        dot.classList.add('dot')
        bubble.append(dot)
    }

    loader.append(bubble)
    document.querySelector('#chat-message-list').append(loader);
}

function deleteLoading() {
    document.querySelector('.loading').remove();

}

document.addEventListener('DOMContentLoaded', () => {
    const messages = document.querySelector('#chat-message-list');
    const chatInput = document.querySelector('#chat-input');

    createMessage("Hi, thanks for contacting Apple technical support. How can I help you?", "agent");
    createSpace("different")
    

    document.querySelector('form').onsubmit = () => {


        const question = chatInput.value;
        createMessage(question, "user");
        chatInput.value = '';
        chatInput.disabled = true;

        

        createSpace("different");
        createMessage("Sure, I can help with this.", "agent");
        createSpace("same");
        createLoading()
        
        
        

        fetch('https://polar-v2-api.onrender.com/questions', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({question: question, uuid: localStorage.getItem('uuid')})
        })
        .then(response => response.json())
        .then(data => {
            const questions = data.questions;
            const sessionId = data.sessionId

            deleteLoading();
            createMessage("Which of these is your question?", "agent");
            createSpace("different");
            createOptions(questions);

            document.querySelectorAll('.option').forEach((option) => {
                option.onclick = () => {
                    let finalQuestion = option.innerText;
                    option.classList.remove('option');
                    option.onclick = '';
                    document.querySelectorAll('.option').forEach((unselected) => {
                        unselected.remove();
                    });

                    createSpace("different")
                    createLoading();

                    fetch('https://polar-v2-api.onrender.com/solutions', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        }, 
                        body: JSON.stringify({question: finalQuestion, sessionId: sessionId})
                    })
                    .then(response => response.json())
                    .then(data => {
                        const solutions = data.solutions;
                        deleteLoading();
                        giveSolutions(solutions);
                    })
                    .catch(error => {
                        console.log('Error:', error);
                        deleteLoading();
                        createSpace("same")
                        createMessage("Sorry, something went wrong.", "agent");
                    })
    
                    
    
                }
            })
    
        })
        .catch(error => {
            console.log('Error:', error);
            deleteLoading();
            createSpace("same")
            createMessage("Sorry, something went wrong.", "agent");
        })




       
        return false;
    }


})

