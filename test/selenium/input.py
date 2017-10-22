from __future__ import print_function

import csv
import time

from selenium import webdriver


browser = webdriver.Chrome()

try:
    browser.get('http://localhost:8080/')
    time.sleep(2)

    # Input username
    msg_input_elt = browser.find_element_by_css_selector('.modal-body input')
    msg_input_elt.send_keys('leapchat_test_user')

    time.sleep(0.5)

    # Set username
    btn = browser.find_element_by_css_selector('.modal-footer button.btn-primary')
    btn.click()

    # Input message
    msg_input_elt = browser.find_element_by_name('message')
    msg_input_elt.send_keys('Hello, Muhammad... :smiley:')

    # Send message
    btn = browser.find_element_by_css_selector('div.message button.btn-default')
    btn.click()

    time.sleep(3)

finally:
    browser.close()
