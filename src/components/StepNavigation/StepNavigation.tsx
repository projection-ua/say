import s from './StepNavigation.module.css';

interface StepNavigationProps {
    currentStep: number; // 1, 2, 3
    onStepClick: (step: number) => void; // теж 1, 2, 3
}

const steps = [
    { label: 'Контактні дані' },
    { label: 'Доставка' },
    { label: 'Оплата' },
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
                                                                  currentStep,
                                                                  onStepClick,
                                                              }) => {
    return (
        <div className={s.stepNavigation}>
            <div className={s.stepsNavWrap}>
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div
                            key={index}
                            className={`${s.step} ${isActive ? s.active : ''} ${isCompleted ? s.completed : ''}`}
                            onClick={() => {
                                if (!isActive) onStepClick(stepNumber);
                            }}
                        >
                            <div className={s.circle}>{stepNumber}</div>
                            <span>{step.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className={s.progressBar}>
                <div
                    className={s.progress}
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                    }}
                />
            </div>
        </div>
    );
};
