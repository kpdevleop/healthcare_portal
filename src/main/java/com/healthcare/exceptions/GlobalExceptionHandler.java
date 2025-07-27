package com.healthcare.exceptions;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.AccessDeniedException;
//import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.healthcare.custom_exceptions.InvalidInputException;
import com.healthcare.custom_exceptions.ResourceNotFoundException;
import com.healthcare.dto.ApiResponse;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice // declares a spring bean containing
//cross cutting concern(repetitive logic) of exc handling
//= @ControllerAdvice - class level + @ResponseBody - all exc handling methods
public class GlobalExceptionHandler {
	// add exception handling method - to handle ResourceNOtFoundException
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException e) {
		System.out.println("in catch - Res not found exc");
		return ResponseEntity.status(HttpStatus.NOT_FOUND)// SC 404
				.body(new ApiResponse(e.getMessage()));
	}
//
//	// add exception handling method - to handle authentication failure
//	@ExceptionHandler(AuthenticationException.class)
//	public ResponseEntity<?> handleAuthenticationException(AuthenticationException e) {
//		System.out.println("in catch -invalid authentication");
//		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)// SC 401
//				.body(new ApiResponse(e.getMessage()));
//	}
//	
//	// add exception handling method - to handle authorization failure
//	@ExceptionHandler(AccessDeniedException.class)
//	public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException e) {
//		System.out.println("in catch access denied exc "+e);
//	
//		return ResponseEntity.status(HttpStatus.FORBIDDEN)// SC 403
//				.body(new ApiResponse(e.getMessage()));
//		
//	}


	// add exception handling method - to handle bad request - invalid input
	@ExceptionHandler(InvalidInputException.class)
	public ResponseEntity<?> handleInvalidInputException(InvalidInputException e) {
		System.out.println("in catch -invalid input exc");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)// SC 400
				.body(new ApiResponse(e.getMessage()));
	}

	// add exception handling method - to catch remaining excs (catch-all)
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<?> handleInvalidInputException(RuntimeException e) {
		System.out.println("in catch all");
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)// SC 500
				.body(new ApiResponse(e.getMessage()));
	}

	// add exception handling method - to handle method arg not valid exc
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleInvalidInputException(MethodArgumentNotValidException e) {
		System.out.println("in catch -MethodArgumentNotValidException");
		// to send error JSON to the front
		// 1. get list FieldError
//			List<FieldError> fieldErrors = e.getFieldErrors();
//			//2. Covert List -> Map<Key : field name , Value : err mesg>
//			Map<String, String> errorMap=new HashMap<>();
//			fieldErrors.forEach(fieldErr -> 
//			errorMap.put(fieldErr.getField(), e.getMessage()));
		Map<String, String> errorMap = e.getFieldErrors().stream()
				.collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)// SC 400
				.body(errorMap);
	}

	// add exception handling method - to handle ConstraintViolationExce
	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<?> handleConstraintViolationException(ConstraintViolationException e) {
		System.out.println("in catch - ConstraintViolationException");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)// SC 400
				.body(new ApiResponse(e.getMessage()));
	}
}
