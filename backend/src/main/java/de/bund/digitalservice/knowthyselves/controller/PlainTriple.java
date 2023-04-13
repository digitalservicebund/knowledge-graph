package de.bund.digitalservice.knowthyselves.controller;

public record PlainTriple(
    String subject,
    String predicate,
    String object,
    String type
) {}
