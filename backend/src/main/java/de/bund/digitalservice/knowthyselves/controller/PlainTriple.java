package de.bund.digitalservice.knowthyselves.controller;

public record PlainTriple(
    String subject,
    String subjectType,
    String predicate,
    String object,
    String objectType,
    String source
) {}
