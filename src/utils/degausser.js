export function degausser(input) {
    // Use a regular expression to replace HTML tags with an empty string
    return input.replace(/<[^>]*>/g, '');
}
