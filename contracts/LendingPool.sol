// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ICreditTokenFactory.sol";

contract LendingPool {
    IERC20 public immutable friendToken;
    ICreditTokenFactory public immutable creditTokenFactory;

    struct Loan {
        address borrower;
        address creditToken;
        uint256 principal;
        uint256 collateral;
        uint256 interestRate; // Annual interest rate in basis points (e.g., 500 = 5%)
        uint256 duration; // Loan duration in seconds
        uint256 startTime;
        bool repaid;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        address creditToken,
        uint256 principal,
        uint256 collateral,
        uint256 interestRate
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
    event LoanLiquidated(uint256 indexed loanId, address indexed borrower);

    modifier onlyValidCreditToken(address creditTokenAddress) {
        require(
            ICreditTokenFactory(creditTokenFactory).getCreditToken(
                getOriginalOwner(creditTokenAddress)
            ) == creditTokenAddress,
            "Invalid credit token"
        );
        _;
    }

    constructor(
        address _friendToken,
        address _creditTokenFactory
    ) {
        friendToken = IERC20(_friendToken);
        creditTokenFactory = ICreditTokenFactory(_creditTokenFactory);
        nextLoanId = 1;
    }

    function createLoan(
        address creditToken,
        uint256 principal,
        uint256 interestRate,
        uint256 duration
    )
        external
        onlyValidCreditToken(creditToken)
    {
        require(principal > 0, "Principal must be greater than zero");
        require(interestRate > 0, "Interest rate must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");

        //  In a real implementation this should be replaced by a more accurate value from an oracle.
        uint256 collateral = calculateCollateral(
            creditToken,
            principal,
            interestRate
        );

        require(
            IERC20(creditToken).transferFrom(
                msg.sender,
                address(this),
                collateral
            ),
            "Collateral transfer failed"
        );
        require(
            friendToken.transferFrom(msg.sender, address(this), principal),
            "Principal transfer failed"
        );

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            creditToken: creditToken,
            principal: principal,
            collateral: collateral,
            interestRate: interestRate,
            duration: duration,
            startTime: block.timestamp,
            repaid: false
        });

        emit LoanCreated(
            loanId,
            msg.sender,
            creditToken,
            principal,
            collateral,
            interestRate
        );
    }

    function repayLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not borrower");
        require(!loan.repaid, "Loan already repaid");
        require(
            block.timestamp <= loan.startTime + loan.duration,
            "Loan expired"
        );

        uint256 interest = (loan.principal * loan.interestRate) / 10000; // Calculate interest
        uint256 totalRepayment = loan.principal + interest;

        require(
            friendToken.transferFrom(msg.sender, address(this), totalRepayment),
            "Repayment transfer failed"
        );

        IERC20(loan.creditToken).transfer(
            loan.borrower,
            loan.collateral
        );
        loan.repaid = true;

        emit LoanRepaid(loanId, msg.sender);
    }

    function liquidateLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(
            block.timestamp > loan.startTime + loan.duration,
            "Loan not expired"
        );
        require(!loan.repaid, "Loan already repaid");
        IERC20(loan.creditToken).transfer(
            msg.sender,
            loan.collateral
        );
        loan.repaid = true; // Mark as repaid to prevent further actions

        emit LoanLiquidated(loanId, msg.sender);
    }

    // Returns the original owner of the credit token.
    function getOriginalOwner(address creditTokenAddress) internal view returns (address){
        (bool success, bytes memory result) = creditTokenAddress.staticcall(
            abi.encodeWithSignature("owner()")
        );
        require(success, "owner() call failed");
        return abi.decode(result, (address));
    }

    // This is a placeholder. In a real implementation, you would use a Chainlink oracle or another reliable source.
    function calculateCollateral(
        address creditToken,
        uint256 principal,
        uint256 interestRate
    ) internal view returns (uint256) {
        return principal * 2;
    }
}
