package com.octo.keip.flow;

import javax.xml.transform.ErrorListener;
import javax.xml.transform.TransformerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class DefaultErrorListener implements ErrorListener {
  private static final Logger LOGGER = LoggerFactory.getLogger(DefaultErrorListener.class);

  @Override
  public void warning(TransformerException exception) {
    LOGGER.warn("{}", exception.getMessage());
  }

  @Override
  public void error(TransformerException exception) {
    LOGGER.error("{}", exception.getMessage());
  }

  @Override
  public void fatalError(TransformerException exception) throws TransformerException {
    throw exception;
  }
}
