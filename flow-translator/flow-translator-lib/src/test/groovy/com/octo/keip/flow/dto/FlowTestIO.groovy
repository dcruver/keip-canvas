package com.octo.keip.flow.dto

import java.nio.file.Path

class FlowTestIO {

    static BufferedReader readJson(String filename) {
        Path path = Path.of("json").resolve(filename)
        return FlowTestIO.class.getClassLoader()
                         .getResource(path.toString())
                         .newReader()
    }
}
