use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("F1UDHMB2xcW93jVC5GjyLTo9KmL75WWf56AfrCrPDwJ1");

#[program]
pub mod write_nft {
    use super::*;

    pub fn mint_article_nft(
        ctx: Context<MintArticle>,
        _title: String,
        _symbol: String,
        _uri: String,
        _seller_fee_basis_points: u16,
    ) -> Result<()> {
        msg!("Minting Article Token...");

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        mint_to(cpi_ctx, 100)?;

        msg!("Article Token minted successfully!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintArticle<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
