package com.healthcare.custom_exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ScheduleAlreadyBookedException extends RuntimeException {

    public ScheduleAlreadyBookedException(String message) {
        super(message);
    }
}
