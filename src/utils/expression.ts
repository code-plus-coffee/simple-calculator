import Stack from './stack'

const operators = ['+', '-', '*', '/', '^']
const leadingZeroesPattern: RegExp = /(^[0+\-*\/]{1,})/g
const trailingSymbolsPattern: RegExp = /([+\-*\/]{1,}$)/g
const stripPattern: RegExp = /(^[0+\-*\/]{1,})|([+\-*\/]{1,}$)/gi
const multipleOperatorsPattern: RegExp = /(?=\d)|([\+\*\/]{2,})|(?=\d)/g
const negativeOperatorsPattern: RegExp = /([\+\-\*\/])(-?[0-9]\d*(\.\d+)?)/g

class Expression {
    private readonly stripPattern: RegExp
    private readonly operatorsPattern: RegExp
    private readonly negativeOperatorsPattern: RegExp
    private expression: string

    constructor(expression: string) {
        this.expression = expression
        this.stripPattern = /(^[0+\-*\/]{1,})|([+\-*\/]{1,}$)/gi
        this.operatorsPattern = /([\+\-\*\/])/g
        this.negativeOperatorsPattern = /([\+\-\*\/])(-?[0-9]\d*(\.\d+)?)/g
    }

    /**
     * Converts the expression from infix to postfix notation.
     */
    public toPostfix = (): string => {
        if (this.expression.length) {
            let stack: Stack = new Stack()
            let postfixList: string[] = new Array<string>()
            let tokens: string[] = this.expression
                .replace(this.operatorsPattern, ' $1 ')
                .split(' ')
                .filter((x) => x.length !== 0)

            tokens.forEach((token) => {
                if (this.isNumeric(token)) {
                    postfixList.push(token)
                } else if (token === '(') {
                    stack.push(token)
                } else if (token === ')') {
                    let top = stack.pop()

                    while (top !== '(') {
                        postfixList.push(top)
                        top = stack.pop()
                    }
                } else {
                    while (!stack.isEmpty() && this.comparePrecedence(token, stack.peek())) {
                        postfixList.push(stack.pop())
                    }

                    stack.push(token)
                }
            })

            while (!stack.isEmpty()) {
                postfixList.push(stack.pop())
            }

            return postfixList.join(' ')
        }

        return ''
    }

    /**
     * Converts the expression to postfix & evaluates.
     */
    public evaluatePostfix = (): number => {
        if (this.expression.length) {
            let operandStack = new Stack()
            let pfixExpression: string = this.toPostfix()
            let tokens = pfixExpression.split(' ')
            let res: number = 0

            tokens.forEach((token) => {
                if (this.isNumeric(token)) {
                    operandStack.push(parseFloat(token))
                } else {
                    let operand2 = operandStack.pop()
                    let operand1 = operandStack.pop()
                    let result = this.performMath(token, operand1, operand2)
                    operandStack.push(result)
                }
            })

            res = operandStack.pop()
            return res
        }

        return -1
    }

    /**
     * Calculates the result for given operands along with the operator.
     */
    private performMath = (operator: string, operand1: number, operand2: number): number => {
        switch (operator) {
            case '*':
                return operand1 * operand2
            case '/':
                return operand1 / operand2
            case '+':
                return operand1 + operand2
            case '-':
                return operand1 - operand2
            default:
                return 0
        }
    }

    /**
     * Checks if the given target is a number.
     * @param target The target to be checked.
     * @returns {boolean} `true`, if the target is a number and `false` otherwise.
     */
    private isNumeric = (target: any): boolean => {
        return !isNaN(parseFloat(target)) && isFinite(target)
    }

    /**
     * Computes the precedence of the operator passed as the argument.
     * @param operator The operator of which precedence is to be computed.
     * @returns {number} The operator precedence as an integer value.
     */
    private precedence = (operator: string): number => {
        switch (operator) {
            case '^':
                return 3
            case '*':
            case '/':
                return 2
            case '+':
            case '-':
                return 1
            default:
                return 0
        }
    }

    /**
     * Compare the precedence of given two operators.
     */
    private comparePrecedence = (operator1: string, operator2: string): boolean => {
        return this.precedence(operator1) <= this.precedence(operator2)
    }
}

export default Expression
