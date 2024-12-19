import json
import csv
import logging
import sys
import os
from bs4 import BeautifulSoup
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time
import traceback
import shutil

# Exit codes
EXIT_SUCCESS = 0
EXIT_NO_ELEMENT = 1
EXIT_TIMEOUT = 2
EXIT_FILE_ERROR = 3
EXIT_BROWSER_ERROR = 4
EXIT_UNKNOWN_ERROR = 5

def setup_logging():
    """Setup logging configuration"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = f'merchant_scraper_{timestamp}.log'

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_filename),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return log_filename

def clean_type_text(text):
    """Remove the MCC code and clean the type text"""
    type_text = text[4:].strip()
    type_text = type_text.replace('(', '').replace(')', '').strip()
    return type_text

def cleanup_resources(driver=None, temp_files=None, error_message=None, exit_code=EXIT_SUCCESS):
    """Cleanup resources before exiting"""
    try:
        # Close the browser
        if driver:
            driver.quit()
            logging.info("Browser closed successfully")

        # Clean up temporary files
        if temp_files:
            for file in temp_files:
                if os.path.exists(file):
                    os.remove(file)
                    logging.info(f"Removed temporary file: {file}")

        # Clean up Chrome temporary files
        chrome_temp = os.path.join(os.getenv('TEMP', '/tmp'), 'chrome_automation')
        if os.path.exists(chrome_temp):
            shutil.rmtree(chrome_temp, ignore_errors=True)
            logging.info("Cleaned up Chrome temporary files")

    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")

    if error_message:
        logging.error(f"Exiting due to error: {error_message}")

    if exit_code != EXIT_SUCCESS:
        sys.exit(exit_code)

def fetch_merchant_data():
    # Setup logging
    log_filename = setup_logging()
    temp_files = [log_filename]
    driver = None

    try:
        # Read the JSON file
        logging.info("Reading stores.json file...")
        with open('stores.json', 'r') as file:
            stores = json.load(file)
    except Exception as e:
        cleanup_resources(temp_files=temp_files,
                        error_message=f"Failed to read stores.json: {str(e)}",
                        exit_code=EXIT_FILE_ERROR)

    # Initialize counter
    total_stores = len(stores)
    counter = 0

    # Create CSV filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f'merchant_data_{timestamp}.csv'
    temp_files.append(csv_filename)

    try:
        # Setup Chrome options
        logging.info("Setting up Chrome browser...")
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-logging')
        chrome_options.add_argument('--log-level=3')

        # Initialize the driver
        driver = webdriver.Chrome(options=chrome_options)
        logging.info("Chrome browser initialized successfully")

    except Exception as e:
        cleanup_resources(temp_files=temp_files,
                        error_message=f"Failed to initialize browser: {str(e)}",
                        exit_code=EXIT_BROWSER_ERROR)

    # Open CSV file for writing
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['Store', 'MCC', 'Type', 'Timestamp', 'Processing Time (s)'])

        base_url = "https://heymax.ai/merchant/"

        try:
            for store in stores:
                counter += 1
                start_time = time.time()

                logging.info(f"\nProcessing {counter} of {total_stores} ({(counter/total_stores*100):.1f}%)")

                formatted_store = store.title()
                url = base_url + formatted_store
                logging.info(f"Processing URL: {url}")

                try:
                    driver.get(url)

                    try:
                        WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.CLASS_NAME, "font-inter"))
                        )
                        time.sleep(3)

                        page_source = driver.page_source
                        soup = BeautifulSoup(page_source, 'html.parser')

                        target_element = soup.find(class_="px-2 py-1 font-inter text-[12px] font-medium text-[#5046C5]")

                        if target_element:
                            full_text = target_element.text.strip()
                            mcc = full_text[:4]
                            merchant_type = clean_type_text(full_text)
                            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            processing_time = round(time.time() - start_time, 2)

                            csv_writer.writerow([
                                formatted_store,
                                mcc,
                                merchant_type,
                                current_time,
                                processing_time
                            ])

                            logging.info(f"Successfully processed: {formatted_store}")
                            logging.info(f"MCC: {mcc}")
                            logging.info(f"Type: {merchant_type}")
                            logging.info(f"Processing time: {processing_time}s")
                        else:
                            error_msg = f"No element found for: {formatted_store}"
                            logging.error(error_msg)
                            cleanup_resources(
                                driver=driver,
                                temp_files=temp_files,
                                error_message=error_msg,
                                exit_code=EXIT_NO_ELEMENT
                            )

                    except TimeoutException:
                        error_msg = f"Timeout waiting for element on {formatted_store}"
                        logging.error(error_msg)
                        cleanup_resources(
                            driver=driver,
                            temp_files=temp_files,
                            error_message=error_msg,
                            exit_code=EXIT_TIMEOUT
                        )

                except Exception as e:
                    error_msg = f"Error processing {formatted_store}: {str(e)}"
                    logging.error(error_msg)
                    logging.error(traceback.format_exc())
                    cleanup_resources(
                        driver=driver,
                        temp_files=temp_files,
                        error_message=error_msg,
                        exit_code=EXIT_UNKNOWN_ERROR
                    )

        finally:
            cleanup_resources(driver=driver)

    logging.info(f"\nProcessing complete! {counter} stores processed")
    logging.info(f"Data has been saved to {csv_filename}")
    logging.info(f"Logs have been saved to {log_filename}")

if __name__ == "__main__":
    fetch_merchant_data()
