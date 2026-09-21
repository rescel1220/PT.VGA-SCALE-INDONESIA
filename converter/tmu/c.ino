// // String print_move2(String tmpText, char* tmpChar, size_t size) {
// //   String tmpString = "";
// //   int panjangkarakter = tmpText.length();
// //   int mulaidari = size - panjangkarakter;
// //   for (int i = 0; i < mulaidari; i++) {
// //     tmpString += "0";
// //     tmpText.toCharArray(operatorName_array, size);
// //   }
// //   tmpString += operatorName_array;
// //   return tmpString;
// // }


// void print_berat(int count, float berat) {
//   int x = 1;
//   String count_print = print_move(String(count), no_array, sizeof(no_array), x);
//   String weight_print = print_move(String(berat), weight_array, sizeof(weight_array), x);
//   to_print(String("   NO. " + count_print + " WT" + weight_print + "  " + " g"));
//   //addDataToFile(pathFile, "NO. " + count_print + " WT" + weight_print + "  " + unitWeight);
// }

// void to_print(String message) {
//   Scale.println(message);
//   Serial.println(message);
// }

// String print_move(String tmpText, char* tmpChar, size_t size, int x) {
//   char operatorName_array[15];
//   String tmpString = "";
//   int panjangkarakter = tmpText.length();
//   int mulaidari = size - panjangkarakter;

//   for (int i = 0; i < mulaidari; i++) {
//     if (x == 0) {
//       tmpString += "0";
//     } else if (x == 1) {
//       tmpString += " ";
//     }
//     tmpText.toCharArray(operatorName_array, size);
//   }
//   tmpString += operatorName_array;
//   return tmpString;
// }