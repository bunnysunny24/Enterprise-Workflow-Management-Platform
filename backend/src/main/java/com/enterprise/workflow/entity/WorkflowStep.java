package com.enterprise.workflow.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workflow_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_definition_id", nullable = false)
    @JsonBackReference
    private WorkflowDefinition workflowDefinition;

    @Column(nullable = false, length = 100)
    private String stepName;

    @Column(nullable = false, length = 50)
    private String stepKey;

    @Column(nullable = false)
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Role requiredRole;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StepType stepType = StepType.APPROVAL;

    @Builder.Default
    @Column(nullable = false)
    private Integer timeoutHours = 24;

    @Builder.Default
    @Column(nullable = false)
    private boolean initialStep = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean terminalStep = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    public enum StepType {
        SUBMISSION,
        REVIEW,
        APPROVAL,
        NOTIFICATION,
        COMPLETION
    }
}
