
// int add_catalis(int k) {
//   switch (k) {
//     case 1:
//       k = add(k, "Catalis", directoryName_product, "edit_produk");
//       break;
//     case 2:
//       k = input_minmax(k, "Min", "");
//       break;
//     case 3:
//       k = input_minmax(k, "Max", "");
//       break;
//   }
//   return k;
// }


int add(int k, String variable, String direktori, String tmpVariable) {
  String hasil_variable = tmpVariable;
  lcd.clear();
  while (1) {
    lcd.setCursor(0, 0);
    lcd.print(String("Add ") + variable);
    text_input();
    if (inputTex == "BACK") {
      tanda = 0;
      k = k - 2;
      inputTex = "";
      lcd.clear();
      lcd.noBlink();
      return k;
      break;
    }
    if (inputTex != "BACK" && tanda == 1 && inputTex != "") {

      if (variable == "Operator") {
        hasil_variable = inputTex;
        Serial.println(String(direktori + "  " + hasil_variable));
        appendFile(SD, direktori, hasil_variable);
        lcd.clear();
        Serial.println(String("Save ") + variable);
        lcd.setCursor(0, 0);
        lcd.print(String("Save ") + variable);
        delay(1000);
      } else if (variable == "Catalis") {
        // edit_produk = inputTex;
        // Serial.println(edit_produk);
        hasil_variable = inputTex;
        Serial.println(String(direktori + "  " + hasil_variable));
        appendFile(SD, direktori, hasil_variable);
        lcd.clear();
        Serial.println(String("Save ") + variable);
        lcd.setCursor(0, 0);
        lcd.print(String("Save ") + variable);
        delay(1000);
      }

      lcd.clear();
      inputTex = "";
      tanda = 0;
      break;
    }
  }
  return k;
}

// int change_produk(int k) {
//   switch (k) {
//     case 1:
//       k = check_variable(k, "Catalis", directoryName_product, "produkName", "");
//       break;
//     case 2:
//       k = add(k, "Catalis", directoryName_product, "edit_produk");
//       break;
//     case 3:
//       k = input_minmax(k, "Min", "change");
//       break;
//     case 4:
//       k = input_minmax(k, "Max", "change");
//       break;
//   }
//   return k;
// }





int check_variable(int k, String variable, String direktori, String tmpVariable, String mode) {
  lcd.clear();
  // String hasil_variable = tmpVariable;
  String hasil_variable;
  String hasil;
  while (1) {
    lcd.setCursor(xCursor - 1, 1);
    lcd.blink();
    delay(50);
    lcd.setCursor(0, 0);
    lcd.print(variable + String(" ID :"));
    input_number();
    if (inputString == "BACK") {
      tanda = 0;
      k = k - 2;
      indexx = 0;
      inputString = "";
      lcd.clear();
      lcd.noBlink();
      return k;
      break;
    }
    if (inputString != "BACK" && tanda == 1 && inputString != "") {
      lcd.noBlink();
      hasil_variable = readFromSdCard(inputString.toInt(), direktori);
      //old_catalis = hasil_variable;
      if (variable == "Catalis") {
        produkName = hasil_variable;
        // int index = var_change.indexOf('&');
        // int index2 = var_change.indexOf('&', index + 1);
        // hasil = var_change.substring(0, index);
        // String n_low = var_change.substring(index + 1, index2);
        // String n_high = var_change.substring(index2 + 1);
        // low = n_low.toFloat();
        // high = n_high.toFloat();
        // produkName = hasil;
        // Serial.println(String("Caatalis Name= ") + produkName);
        // Serial.println(String("Nilai LOW Produk = ") + low);
        // Serial.println(String("Nilai HIGH Produk = ") + high);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(variable + String(" Name :"));
        lcd.setCursor(0, 1);
        lcd.print(produkName);
        Serial.println(variable + "= " + produkName);
        delay(1000);
        lcd.clear();
      }
      if (variable == "Operator") {
        operatorName = hasil_variable;
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(variable + String(" Name :"));
        lcd.setCursor(0, 1);
        lcd.print(operatorName);
        Serial.println(variable + "= " + operatorName);
        delay(1000);
        lcd.clear();
      }
      // if (index != -1) {
      //   produkName = hasil;
      //   Serial.println(String("Caatalis Name= ") + produkName);
      //   Serial.println(String("Nilai LOW Produk = ") + low);
      //   Serial.println(String("Nilai HIGH Produk = ") + high);
      //   lcd.clear();
      //   lcd.setCursor(0, 0);
      //   lcd.print(variable + String(" Name :"));
      //   lcd.setCursor(0, 1);
      //   lcd.print(produkName);
      //   delay(1000);
      //   lcd.clear();
      // }
      if (mode == "hapus") {
        deleteValue(direktori, hasil_variable, direktori);
        Serial.println(direktori);
        lcd.clear();
        lcd.setCursor(4, 0);
        lcd.print(variable);
        lcd.setCursor(4, 1);
        lcd.print("DELETED");
        delay(1000);
        lcd.clear();
        mode = "";
        break;
      }
      tanda = 0;
      inputString = "";
      if (hasil_variable != "Not Found") {

        break;
      }
    }
  }
  // if ((hasil_variable == "Not Found" || hasil_variable == "error opening") && tanda == 1) {
  //   Serial.println(hasil_variable);
  //   Serial.println("Eroor");
  //   inputString = "";
  //   tanda = 0;
  //   return k;
  // }
  return k;
}


void deleteValue(String filename, String valueToDelete, String direktori) {
  File file = SD.open(filename);
  if (!file) {
    Serial.println("Error opening file for reading.");
    return;
  }
  String buffer = "";
  while (file.available()) {
    String line = file.readStringUntil('\n');
    if (line.indexOf(valueToDelete) == -1) {
      buffer += line + "\n";
    }
  }
  if (!file) {
    Serial.println("Error opening file for writing.");
    return;
  }
  SD.remove(direktori);
  String filename2 = direktori;
  file = SD.open(filename2, FILE_WRITE);
  file.print(buffer);
  file.close();
  Serial.println("Value Produk deleted successfully.");
  tanda = 0;
  inputString = "";
}




int change(int k, String var_1, String direktori, String var_2) {
  switch (k) {
    case 1:
      k = check_variable(k, var_1, direktori, var_2, "");
      break;
    case 2:
      k = Subtitusion(k, var_1, direktori);
      break;
  }
  return k;
}



int Subtitusion(int k, String var_1, String direktori) {
  lcd.clear();
  while (1) {
    lcd.setCursor(0, 0);
    lcd.print(String("Replace ") + var_1);
    text_input();
    if (inputTex == "BACK") {
      tanda = 0;
      k = k - 2;
      inputTex = "";
      lcd.clear();
      return k;
      break;
    }
    if (inputTex != "BACK" && tanda == 1 && inputTex != "") {
      String new_variable = inputTex;
      if (var_1 == "Catalis") {
        replaceValueInFile(direktori, produkName, new_variable);
      } else if (var_1 == "Operator") {
        replaceValueInFile(direktori, operatorName, new_variable);
      }
    //  replaceValueInFile(direktori, var_change, new_variable);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Replaced");
      delay(1000);
      lcd.clear();
      inputTex = "";
      tanda = 0;
      break;
    }
  }
  return k;
}
/////////////////////////////////////////////////////////
void replaceValueInFile(String filename, String oldValue, String newValue) {
  File file = SD.open(filename, FILE_READ);
  if (!file) {
    Serial.println("Error opening file.");
    return;
  }
  String content = "";
  while (file.available()) {
    content += (char)file.read();
  }
  int index = content.indexOf(oldValue);
  if (index != -1) {
    content.replace(oldValue, newValue);
    Serial.println("Value replaced.");

  } else {
    Serial.println("Value not found.");
    return;
  }
  SD.remove(filename);
  file = SD.open(filename, FILE_WRITE);
  file.print(content);
  file.close();
}