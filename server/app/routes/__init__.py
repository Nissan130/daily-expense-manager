from .health import health_bp
from .authRoutes import auth_bp
from .expenseRoutes.expense_routes import expense_bp
from .budgetRoutes.budget_routes import budget_bp
from .settingsRoutes.settings_routes import settings_bp

def register_routes(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(settings_bp)
