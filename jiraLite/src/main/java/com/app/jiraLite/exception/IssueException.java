package com.app.jiraLite.exception;

public class IssueException extends RuntimeException {

    private String resourceName;
    private String fieldName;
    private Object fieldValue;

    public IssueException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s error: %s '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public IssueException(String message) {
        super(message);
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public Object getFieldValue() {
        return fieldValue;
    }
}
