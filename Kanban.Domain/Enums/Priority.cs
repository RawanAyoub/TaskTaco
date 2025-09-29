namespace Kanban.Domain.Enums;

/// <summary>
/// Represents the priority level of a task in the TaskTaco Kanban system.
/// </summary>
public enum Priority
{
    /// <summary>
    /// Low priority task - can be completed when time permits.
    /// </summary>
    Low = 1,

    /// <summary>
    /// Medium priority task - should be completed in reasonable time.
    /// </summary>
    Medium = 2,

    /// <summary>
    /// High priority task - requires immediate attention and completion.
    /// </summary>
    High = 3
}