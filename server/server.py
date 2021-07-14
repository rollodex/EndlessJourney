#!/usr/bin/env python3
"""
Send a prompt encoded in JSON to the game server
Usage::
    ./server.py [<port>]
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
import os
import openai
import json

openai.api_key = ""

class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_PUT(self):
        logging.info("PUT request,\n\rPath: %s\n\rHeaders:\n\r%s\n\r", str(self.path), str(self.headers))
        self._set_response()
        self.wfile.write("PUT request for {}".format(self.path).encode('utf-8'))
        post_data = self.rfile.read(content_length) # <--- Gets the data itself

        response = openai.Completion.create(
            engine="davinci",
            prompt=post_data,
            temperature=0.66,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0.18,
            presence_penalty=0.32
          )

        self._set_response()
        self.wfile.write(response.choices[0].text.encode()) #.format(self.path).encode('utf-8'))
        logging.info(response.choices[0].text.encode())


    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                str(self.path), str(self.headers), post_data.decode('utf-8'))
        the_json = post_data.decode('utf-8')
        the_dict =  json.loads(the_json)
        header= "AI Bandersnatch Choose Your Own Adventure Game\n\n------------\n\n"
        pretext = "Date:7/1\nBranch:In this world, you can be who you want to be. All you must do is awaken and enter your truest desires. Let the games begin! \nEmotion: optimistic | Adjectives: exicted, fascinated | Energy: 100% | Water: 100% | Integrity: 100% | Affiliation: 100% | Certainity: 100% | Competence: 100%\nAchievement: Trepid Adventurer\nBranch A: Start the adventure! | Branch B: Stay in bed.\n> You choose Branch A.\n------------\n\n"
        branch_header = "Date:7/2\nBranch:"
        stats_bar = "Emotion: " + the_dict["initial_emotion"] + " | Adjectives: " + the_dict["adj_one"] + ", " + the_dict["adj_two"] + " | Energy: " + the_dict["initial_energy"] + " | Water: " + the_dict["initial_water"] + " | Integrity: " + the_dict["initial_integrity"] + " | Affiliation: " + the_dict["initial_affiliation"] +" | Certainty: " + the_dict["initial_certainty"] + " | Competence: " + the_dict["initial_competence"] + "\n"
        branches = "Branch A: " + the_dict["branch_a"] + " | " + "Branch B: " + the_dict["branch_b"] + "\n"
        branch_choice = "A"
        branch_prompt = "> You chose branch "
        restart_sequence = "\n------------\n"



        prompt = header + pretext + branch_header + the_dict["story"] + "\n" + stats_bar + "\n" + "Acheivement: " + the_dict["initial_ach"] + "\n" + branches + "\n" + branch_prompt + branch_choice + "\n" + restart_sequence
        logging.info(prompt)


        response = openai.Completion.create(
            engine="davinci",
            prompt=prompt,
            temperature=0.66,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0.18,
            presence_penalty=0.32
          )

        self._set_response()
        self.wfile.write(response.choices[0].text.encode()) #.format(self.path).encode('utf-8'))
        #logging.info(response.choices[0].text.encode())

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def run(server_class=HTTPServer, handler_class=S, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')

if __name__ == '__main__':
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
