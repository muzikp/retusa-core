# Retusa: core library

JavaScript basic library for storing and manipulation of vector and matrix types. Supports localization and extensions.

## Root module

### use()

Method "use" lets you manipulate the module.exports object, e.g. adding new methods to Vector prototypes, adding locales etc.

### Vector

Vector is the base and inherited only class for special Vector classes, such as NumericVector, StringVector etc. The base class includes common methods for all the vector types, such as name, label, id, filter, removeEmpty etc.

#### localize(value, data)

Converts the value (code) to human-readable text; optionally add data object including key/value parameters to be alternated in the text. Default language is used.

#### name(value: string | null, <alwaysReturnSelf: boolen = false>)

Gets (if argument is emty)

#### sample(size: float)

Pseudorandomly selects N cases from the vector, based on the size parameter. If size value is > 1, return total of values equal to size. If less then one, select size/100 % of the values. If size = zero, return the entire vector.

#### toString()

Return a serialized vector (as a stringified JSON). Mind that using JSON.stringify(vector) ignores the metadata and should not be used if you want to preserve them.

### NumericVector

This kind of vector accepts only numeric values or values parsable to numbers.
