"""
アプリケーションのエントリポイント。
CLI / GUI / Web いずれの場合も、このファイルは"薄く"保つ。
"""
from src.machining_condition_calculator.core import main


if __name__ == "__main__":
    main()
