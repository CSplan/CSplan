<script>
  import user from '../../stores/user'
</script>

<div class="account-menu">
  <div class="submenu account-card">
    <div class="user-picture">
      <i class="fas fa-user-circle"></i>
    </div>
    <div class="user-info">
      <span class="card-label">Email</span>
      <span>
        <span class="email">{$user.user.email}</span>
        <i class="fas fa-edit clickable"/>
      </span>

      <span class="card-label"></span>
    </div>
  </div>
</div>


<style lang="scss">
  @import '../../scss/colors.scss';
  
  .account-menu {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 2rem;
  }
  .submenu {
    margin: 1.5rem 0;
    min-width: 40%;
  }
  .account-card {
    display: grid;
    grid-template-columns: min-content 1fr;
    grid-template-rows: max-content;
    >div {
      padding: 0.4rem 0.8rem;
      border: 1px solid #aaa;
      background-color: var(--background-dark);
    }
    .user-picture {
      line-height: 1;
      font-size: 5rem;
      grid-column: 1 / span 1;
      text-align: center;
    }
    .user-info {
      text-align: center;
      .card-label {
        display: block;
        font-size: 0.9rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }
      span:not(.card-label) {
        display: inline-block;
        position: relative;
        width: 80%;
        span.email {
          width: 100%;
          padding: 0.4rem;
          background-color: rgba(75, 75, 100, 1);
          border-radius: 2px;
          font-size: 1.2rem;
        }
        i {
          position: absolute;
          left: calc(100% + 0.5rem);
          top: 0.75rem;
          font-size: 0.9rem;
        }
      }
    }
  }
</style>