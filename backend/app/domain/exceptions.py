"""Domain exceptions. Raised by services; mapped to HTTP by API layer."""


class InvalidCredentials(Exception):
    """Raised when login fails (unknown user or wrong password)."""


class NotFoundError(Exception):
    """Raised when a requested resource does not exist. Message is used as 404 detail."""
