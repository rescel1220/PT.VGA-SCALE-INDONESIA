void input_number() {
  char key = '\0';
  key = keypad.getKey();  // Read a key
  if (key) {
    if (key != 'A' & key != '*' && key != 'B' && key != '#' && key != 'C') {
      indexx++;
      xCursor++;
      lcd.setCursor(indexx - 1, 1);
      lcd.print(key);
    }
    if (key == 'C') {
      inputString = "BACK";
      xCursor = 0;
    } else if (key == '*') {
      lcd.clear();
      xCursor = 0;
      tanda = 1;
      indexx = 0;
    }

    else if (key == '#') {
      indexx--;
      xCursor--;
      if (inputString.length() > 0) {
        inputString.remove(inputString.length() - 1);  // Remove last character                                                       //  Serial.println(inputString);
        lcd.clear();
        lcd.setCursor(0, 1);
        lcd.print(inputString);
      }
    }
    if (key != 'A' && key != '*' && key != 'B' && key != '#' && key != 'C') {
      inputString += key;
    }
  }
}


void text_input() {

  char key = keypad.getKey();  // Read the key pressed

  if (key) {  // If a key is pressed
    unsigned long currentTime = millis();
    if (key != 'A' && key != 'B') {

      if (key == '*') {  // Use '*' as the enter key
        lcd.clear();
        lcd.setCursor(0, 1);
        lcd.print(inputTex);
        tanda = 1;
        lastKey = '\0';
        pressCount = 0;
        xCursor = 0;
      }

      else if (key == 'C') {
        inputTex = "BACK";
        capslock = 0;
        xCursor = 0;
      } else if (key == '#') {  // Use '#' as a backspace
        if (inputTex.length() > 0) {
          inputTex = inputTex.substring(0, inputTex.length() - 1);
          xCursor--;
        }
        lcd.clear();
        lcd.setCursor(0, 1);
        lcd.print(inputTex);

      } else if (key == 'D') {
        capslock++;
        if (capslock == 2) {
          capslock = 0;
        }
        Serial.println(String("caps= ") + capslock);
      }




      else {
        if (key == lastKey && (currentTime - lastKeyPressTime) < 1000) {
          pressCount++;
          pressCount %= getCharCount(key);  // Cycle through characters

        } else {
          inputTex += getChar(key, 0);  // Append the first character
          xCursor++;

          pressCount = 0;
        }
        inputTex[inputTex.length() - 1] = getChar(key, pressCount);  // Replace the last character                                                                 //  xCursor++;
        lcd.setCursor(0, 1);
        lcd.print(inputTex);
        lastKey = key;
        lastKeyPressTime = currentTime;
      }
    }
  }
  //lcd.noBlink();
}

// Function to get the character based on the key and press count
char getChar(char key, int count) {
  if (capslock == 0) {
    switch (key) {
      case '1': return "1.+-_@"[count];
      case '2': return "2ABC"[count];
      case '3': return "3DEF"[count];
      case '4': return "4GHI"[count];
      case '5': return "5JKL"[count];
      case '6': return "6MNO"[count];
      case '7': return "7PQRS"[count];
      case '8': return "8TUV"[count];
      case '9': return "9WXYZ"[count];
      case '0': return "0 "[count];  // Space on '0'
      default: return key;
    }
  }
  if (capslock == 1) {
    switch (key) {
      case '1': return "1.+-_@"[count];
      case '2': return "2abc"[count];
      case '3': return "3def"[count];
      case '4': return "4ghi"[count];
      case '5': return "5jkl"[count];
      case '6': return "6mno"[count];
      case '7': return "7pqrs"[count];
      case '8': return "8tuv"[count];
      case '9': return "9wxyz"[count];
      case '0': return "0 "[count];  // Space on '0'
      default: return key;
    }
  }
}

// Function to get the number of characters mapped to a key
int getCharCount(char key) {
  switch (key) {
    case '7': return 5;  //
    case '9': return 5;  //
    case '1': return 5;
    case '2': return 4;
    case '3': return 4;
    case '4': return 4;
    case '5': return 4;
    case '6': return 4;
    case '8': return 4;  //
    case '0': return 2;  // Space on '0'
    default: return 1;
  }
}




long parse_scale(String tmpMsg) {
  int msgLen = tmpMsg.length() + 1;
  char msgChar[msgLen];
  String tmpVal;
  long outputValue;
  tmpMsg.toCharArray(msgChar, msgLen);
  for (int i = 0; i < msgLen; i++) {
    if (msgChar[i] == '-') {
      tmpVal = "-";
    }
    if (isDigit(msgChar[i])) {
      tmpVal = tmpVal + msgChar[i];
    }
  }
  outputValue = tmpVal.toInt();
  return outputValue;
}