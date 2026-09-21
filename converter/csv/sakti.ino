//save as dari esp32_demo
//board nya error sayah di pin keypad


// #include <Keypad.h>
// // #include <Wire.h>
// // #include <LiquidCrystal_I2C.h>
// #include <RTClib.h>
// #include <EEPROM.h>
// #include <Statistic.h>
// #include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>
// LiquidCrystal_I2C lcd(0x27, 16, 2);
// SoftwareSerial Printer(35, 32);  // 2 rx, 3 tx noise
// SoftwareSerial Scale(34, 33);

SoftwareSerial Scale(14, 12);


// #define Printer Serial3
// #include <SoftwareSerial.h>
// SoftwareSerial Scale(11, 12);
// SoftwareSerial Printer(13, 14);
// SoftwareSerial Scale(35, 33);
// SoftwareSerial Scale(35, 32);
// SoftwareSerial Printer(34, 33);

// SoftwareSerial Scale(13, 14);
// SoftwareSerial Printer(11, 12);


// SoftwareSerial Printer(35, 32);    // 2 rx, 3 tx
// SoftwareSerial Scale(34, 33);

// char no_array[7];
// char operatorName_array[19];



// char weight_array[12];
// char ID_CODE[8];
// char weight_array2[15];
// char no_array[4];
// int count;
// SoftwareSerial Printer(34, 32);

// SoftwareSerial Scale  (35, 33);  // 2 rx, 3 tx
// SoftwareSerial Printer(16, 17);
  float scaleValue;
  // int wait = 0;
  // int z = 0;
  // int sample = 0;
  // float simpangan;
  // float data;


void setup() {
  Serial.begin(9600);  // Start the serial communication
  Scale.begin(9600);
  // Printer.begin(9600);
  // Serial.println("sampling:");
  // lcd.init();
  // lcd.init();
  // lcd.backlight();
  // lcd.clear();
  //  Scale.begin(1200, SERIAL_7O1);

}
void loop() {

  // if (Serial.available()) {
  //   String weight = Serial.readStringUntil('\n');
  //   Serial.println(weight);
  //   Scale.println(weight);
  //   Printer.println(weight);
  // }
  // if (Scale.available()) {

  //   String message = Scale.readStringUntil('\n');

  //   Serial.println(message);

  // }
  if (Scale.available() > 0) {
    String tmpScaleValue = Scale.readStringUntil('\n');
    long tmpValue = parse_scale(tmpScaleValue);
    scaleValue = tmpValue / (pow(10, 1));
    if (scaleValue > 0) {
        Serial.println(scaleValue);

      }
      }





        //   if (Printer.available()) {
        //   String message = Printer.readStringUntil('\n');

        //   Serial.println(message);
        // }  ///////////////////////////////////////////////////////////////////////////////////////
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
