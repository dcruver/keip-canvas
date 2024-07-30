package com.octo.keip.schema.model.eip;

import com.google.gson.annotations.SerializedName;

public enum ConnectionType {
  @SerializedName("passthru")
  PASSTHRU,
  @SerializedName("request_reply")
  REQUEST_REPLY,
  @SerializedName("sink")
  SINK,
  @SerializedName("source")
  SOURCE,
  @SerializedName("tee")
  TEE,
}
