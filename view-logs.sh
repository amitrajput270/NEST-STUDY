#!/bin/bash

# Log viewer script for NestJS application
LOG_DIR="logs"

echo "🔍 NestJS Log Viewer"
echo "===================="

if [ ! -d "$LOG_DIR" ]; then
    echo "❌ Log directory not found: $LOG_DIR"
    exit 1
fi

echo "📁 Available log files:"
ls -la $LOG_DIR/*.log 2>/dev/null | while read line; do
    echo "   $line"
done

echo ""
echo "📋 Choose an option:"
echo "1. View latest error logs"
echo "2. View latest general logs"
echo "3. View all logs (live tail)"
echo "4. View specific date logs"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚨 Latest Error Logs:"
        echo "==================="
        if [ -f "$LOG_DIR/error-$(date +%Y-%m-%d).log" ]; then
            tail -n 10 "$LOG_DIR/error-$(date +%Y-%m-%d).log" | jq '.'
        else
            echo "No error logs found for today"
        fi
        ;;
    2)
        echo "ℹ️  Latest General Logs:"
        echo "======================"
        if [ -f "$LOG_DIR/general-$(date +%Y-%m-%d).log" ]; then
            tail -n 10 "$LOG_DIR/general-$(date +%Y-%m-%d).log" | jq '.'
        else
            echo "No general logs found for today"
        fi
        ;;
    3)
        echo "👁️  Live Log Monitoring (Ctrl+C to stop):"
        echo "=========================================="
        tail -f $LOG_DIR/*.log
        ;;
    4)
        read -p "Enter date (YYYY-MM-DD): " log_date
        echo "📅 Logs for $log_date:"
        echo "===================="
        ls $LOG_DIR/*-$log_date.log 2>/dev/null | while read file; do
            echo ""
            echo "📄 File: $file"
            echo "---"
            cat "$file" | jq '.'
        done
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac
