void print_argox(String berat) {

  String writeData = ("A0,7,0,3,1,2,N,\"Nama Item :\"\r\n");  //x,y,rotasi,3,font,Styele
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A160,7,0,3,1,2,N,";
  writeData += "\"";
  writeData += produkName;
  writeData += "\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A0,70,0,3,1,2,N,\"Berat     :\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A160,70,0,3,1,2,N,";
  writeData += "\"";
  writeData += berat;
  writeData += "\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A0,140,0,3,1,2,N,\"Date-Time :\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A160,140,0,3,1,2,N,";
  writeData += "\"";
 writeData += date_is();
  writeData += "  ";
  writeData += time_is();
  writeData += "\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A0,210,0,3,1,2,N,\"Operator  :\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A160,210,0,3,1,2,N,";
  writeData += "\"";
  writeData += operatorName;
  writeData += "\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A0,280,0,3,1,2,N,\"Mesin     :\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);
  writeData = "A160,280,0,3,1,2,N,";
  writeData += "\"";
  writeData += mesinName;
  writeData += "\"\r\n";
  Printer.print(writeData);
  Serial.print(writeData);



  writeData = "P1\r\n";
  Printer.print(writeData);
}

void export_csv(String berat) { 
    String writeData = "";
    writeData += produkName ;
    writeData += ",";
    writeData += berat;
    writeData += ",";
    writeData += date_is();
    writeData += ",";
    writeData += time_is();
    writeData += ",";
    writeData += operatorName;
    writeData += ",";
    writeData += mesinName;
    // writeData += "\n";
    appendFile(SD, directoryName_record, writeData);
}