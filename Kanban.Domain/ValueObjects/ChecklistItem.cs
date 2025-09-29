namespace Kanban.Domain.ValueObjects;

/// <summary>
/// Represents an individual item within a task's checklist.
/// This is a value object that encapsulates the state of a checklist item.
/// </summary>
public class ChecklistItem
{
    /// <summary>
    /// Gets the unique identifier for this checklist item.
    /// </summary>
    public string Id { get; }

    /// <summary>
    /// Gets the text content of this checklist item.
    /// </summary>
    public string Text { get; }

    /// <summary>
    /// Gets a value indicating whether this checklist item is completed.
    /// </summary>
    public bool Done { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="ChecklistItem"/> class.
    /// </summary>
    /// <param name="id">The unique identifier for this checklist item.</param>
    /// <param name="text">The text content of this checklist item.</param>
    /// <param name="done">A value indicating whether this checklist item is completed.</param>
    public ChecklistItem(string id, string text, bool done = false)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Checklist item ID cannot be null or empty.", nameof(id));
        
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Checklist item text cannot be null or empty.", nameof(text));

        Id = id;
        Text = text;
        Done = done;
    }

    /// <summary>
    /// Creates a new checklist item with the same ID and text but with the done status toggled.
    /// </summary>
    /// <returns>A new ChecklistItem with the done status toggled.</returns>
    public ChecklistItem Toggle()
    {
        return new ChecklistItem(Id, Text, !Done);
    }

    /// <summary>
    /// Creates a new checklist item with the same ID and done status but with updated text.
    /// </summary>
    /// <param name="newText">The new text for the checklist item.</param>
    /// <returns>A new ChecklistItem with updated text.</returns>
    public ChecklistItem UpdateText(string newText)
    {
        return new ChecklistItem(Id, newText, Done);
    }

    /// <summary>
    /// Determines whether two ChecklistItem instances are equal based on their ID, Text, and Done status.
    /// </summary>
    public override bool Equals(object? obj)
    {
        if (obj is not ChecklistItem other)
            return false;

        return Id == other.Id && Text == other.Text && Done == other.Done;
    }

    /// <summary>
    /// Gets the hash code for this ChecklistItem.
    /// </summary>
    public override int GetHashCode()
    {
        return HashCode.Combine(Id, Text, Done);
    }

    /// <summary>
    /// Returns a string representation of this ChecklistItem.
    /// </summary>
    public override string ToString()
    {
        return $"[{(Done ? "✓" : " ")}] {Text}";
    }
}