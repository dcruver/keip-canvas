package com.octo.keip.schema;

import com.octo.keip.schema.cmd.TranslateCommand;
import picocli.CommandLine;

public class XsdParserApplication {
  public static void main(String[] args) {
    int exitCode = new CommandLine(new TranslateCommand()).execute(args);
    System.exit(exitCode);
  }
}
